import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getClientIp, rateLimitCheck, rateLimitHeaders } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

type Check = { ok: boolean; latencyMs?: number; message?: string };

async function timed(fn: () => Promise<void>): Promise<Check> {
  const start = Date.now();
  try {
    await fn();
    return { ok: true, latencyMs: Date.now() - start };
  } catch (error: any) {
    return { ok: false, latencyMs: Date.now() - start, message: error?.message || 'failed' };
  }
}

export async function GET(request: Request) {
  const rl = await rateLimitCheck(`ops-health:${getClientIp(request)}`, 60);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders(rl) });

  const admin = createAdminClient();
  const checks: Record<string, Check> = {};

  checks.database = await timed(async () => {
    const { error } = await admin.from('hotels').select('id').limit(1);
    if (error) throw new Error('Supabase database query failed');
  });

  checks.authConfig = {
    ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY),
    message: 'Supabase env configured',
  };

  checks.publicUrl = {
    ok: Boolean(process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')),
    message: process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') ? 'HTTPS app URL configured' : 'NEXT_PUBLIC_APP_URL must be https:// for go-live',
  };

  checks.billingLive = {
    ok: Boolean(process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') && process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')),
    message: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'Stripe live key detected' : 'Stripe live key missing or still in test mode',
  };

  checks.alerts = {
    ok: Boolean(process.env.OPS_ALERT_WEBHOOK_URL || process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
    message: 'Configure OPS_ALERT_WEBHOOK_URL or Sentry before taking real customers',
  };

  const ok = Object.values(checks).every(check => check.ok);

  return NextResponse.json({
    status: ok ? 'ok' : 'degraded',
    service: 'maitri-pms',
    generatedAt: new Date().toISOString(),
    checks,
  }, { status: ok ? 200 : 503, headers: { ...rateLimitHeaders(rl), 'Cache-Control': 'no-store' } });
}
