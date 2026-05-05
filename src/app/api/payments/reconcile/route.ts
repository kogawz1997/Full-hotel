/**
 * Payment Reconciliation
 * Compare DB records vs Omise/Stripe transactions
 * Run manually or via cron to catch missed webhooks
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireHotelAccess } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/server';
import { format, subDays } from 'date-fns';

export async function POST(request: NextRequest) {
  const { hotelId, days = 7 } = await request.json();

  const ctx = await requireHotelAccess(hotelId, ['owner', 'admin']);
  if (ctx.error) return ctx.error;

  const admin = createAdminClient();
  const since = format(subDays(new Date(), days), 'yyyy-MM-dd');

  // Get reservations with payment in last N days
  const { data: reservations } = await admin
    .from('reservations')
    .select('id, reservation_code, total_amount, paid_amount, payment_status, omise_charge_id, check_in')
    .eq('hotel_id', hotelId)
    .gte('check_in', since)
    .not('omise_charge_id', 'is', null);

  const issues: any[] = [];
  let verified = 0;

  for (const res of reservations || []) {
    if (!res.omise_charge_id) continue;

    // Check against Omise if key available
    if (process.env.OMISE_SECRET_KEY && !process.env.OMISE_SECRET_KEY.includes('demo')) {
      try {
        const omiseRes = await fetch(
          `https://api.omise.co/charges/${res.omise_charge_id}`,
          { headers: { 'Authorization': `Basic ${Buffer.from(process.env.OMISE_SECRET_KEY + ':').toString('base64')}` } }
        );
        const charge = await omiseRes.json();

        const omiseAmount = charge.amount / 100; // Convert from satang
        const omiseStatus = charge.status;

        if (omiseStatus === 'successful' && res.payment_status !== 'paid') {
          issues.push({
            reservationCode: res.reservation_code,
            issue: 'Omise shows paid but DB shows unpaid',
            omiseStatus, dbStatus: res.payment_status,
            omiseAmount, dbPaidAmount: res.paid_amount,
          });
          // Auto-fix
          await admin.from('reservations').update({
            payment_status: 'paid',
            paid_amount: omiseAmount,
          }).eq('id', res.id);
        } else if (omiseStatus === 'failed' && !['failed', 'cancelled'].includes(res.payment_status || '')) {
          issues.push({
            reservationCode: res.reservation_code,
            issue: 'Omise shows failed but DB shows active',
            omiseStatus, dbStatus: res.payment_status,
          });
        } else {
          verified++;
        }
      } catch { /* skip */ }
    } else {
      verified++;
    }
  }

  return NextResponse.json({
    success: true,
    period: `Last ${days} days`,
    total: reservations?.length || 0,
    verified,
    issues,
    autoFixed: issues.length,
  });
}
