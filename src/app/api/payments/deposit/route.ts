import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJson } from '@/lib/http/validation';
import { assertReservationAccess } from '@/lib/auth/guards';
import { rateLimit } from '@/lib/security/rate-limit';

const schema = z.object({
  reservationId: z.string().uuid(),
  amount: z.coerce.number().positive().max(10_000_000),
  method: z.enum(['cash', 'credit_card', 'promptpay', 'bank_transfer', 'ota_paid', 'other']).default('bank_transfer'),
  reference: z.string().max(255).optional().nullable(),
});

export async function POST(request: Request) {
  const limited = await rateLimit(request, 'payments.deposit', 20, 60_000);
  if (limited) return limited;

  const parsed = await parseJson(request, schema);
  if (parsed.error) return parsed.error;

  const { reservationId, amount, method, reference } = parsed.data;
  const ctx = await assertReservationAccess(reservationId);
  if (ctx.error) return ctx.error;
  if (!ctx.reservation) return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });

  const reservation = ctx.reservation;
  const balance = Math.max(0, Number(reservation.total_amount || 0) - Number(reservation.paid_amount || 0));
  if (amount > balance) return NextResponse.json({ error: 'Deposit exceeds balance', balance }, { status: 400 });

  const { data: folio } = await ctx.supabase
    .from('folios')
    .select('id, total_payments, balance')
    .eq('reservation_id', reservationId)
    .eq('hotel_id', reservation.hotel_id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: payment, error } = await ctx.supabase.from('payments').insert({
    hotel_id: reservation.hotel_id,
    reservation_id: reservationId,
    folio_id: folio?.id || null,
    amount,
    currency: reservation.hotels?.currency || 'THB',
    payment_method: method,
    status: 'completed',
    gateway: method === 'ota_paid' ? 'ota' : null,
    gateway_transaction_id: reference || null,
    gateway_response: { purpose: 'deposit', reference },
    payment_purpose: 'deposit',
    paid_at: new Date().toISOString(),
  }).select().single();

  if (error || !payment) return NextResponse.json({ error: error?.message || 'Failed to record deposit' }, { status: 500 });

  await ctx.supabase.from('reservations')
    .update({ paid_amount: Number(reservation.paid_amount || 0) + amount, status: reservation.status === 'pending' ? 'confirmed' : reservation.status })
    .eq('id', reservationId)
    .eq('hotel_id', reservation.hotel_id);

  if (folio?.id) {
    await ctx.supabase.from('folio_items').insert({
      folio_id: folio.id,
      type: 'payment',
      description: `Deposit payment${reference ? ` (${reference})` : ''}`,
      amount: -amount,
      quantity: 1,
      posted_by: ctx.user?.id || null,
      reference_id: payment.id,
      reference_type: 'payment',
    });
    await ctx.supabase.rpc('recalculate_folio_totals', { p_folio_id: folio.id });
  }

  await ctx.supabase.from('audit_logs').insert({
    hotel_id: reservation.hotel_id,
    user_id: ctx.user?.id || null,
    action: 'payment.deposit.recorded',
    entity_type: 'payment',
    entity_id: payment.id,
    changes: { amount, method, reference },
  });

  return NextResponse.json({ success: true, payment });
}
