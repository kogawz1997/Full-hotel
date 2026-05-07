import { NextResponse } from 'next/server';
import { requireHotelAccess } from '@/lib/auth/guards';
import { sendOpsAlert } from '@/lib/ops/alerts';
import { getClientIp, rateLimitCheck, rateLimitHeaders } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rl = await rateLimitCheck(`ops-alert:${getClientIp(request)}`, 20);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders(rl) });

  const ctx = await requireHotelAccess(null, ['owner', 'admin']);
  if (ctx.error) return ctx.error;

  const body = await request.json().catch(() => ({}));
  const result = await sendOpsAlert({
    level: body.level || 'info',
    title: body.title || 'Maitri PMS test alert',
    message: body.message || `Test alert from ${ctx.hotel?.name || 'hotel'}`,
    context: { hotelId: ctx.hotelId, userId: ctx.user?.id, source: 'manual-test' },
  });

  await ctx.supabase.from('operational_events').insert({
    hotel_id: ctx.hotelId,
    event_type: 'ops.alert.test',
    severity: body.level || 'info',
    title: body.title || 'Go-live alert test',
    details: { message: body.message || 'Manual alert test triggered', result },
    source: 'p7-go-live',
  });

  return NextResponse.json({ ok: true, result }, { headers: rateLimitHeaders(rl) });
}
