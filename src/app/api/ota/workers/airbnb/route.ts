import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { readWebhookToken, verifyBearerOrHeaderToken } from '@/lib/security/webhook';
import { rateLimit } from '@/lib/security/rate-limit';

async function runWorker(request: Request) {
  const limited = await rateLimit(request, 'ota.worker.airbnb', 30, 60_000);
  if (limited) return limited;

  const token = readWebhookToken(request);
  if (!verifyBearerOrHeaderToken(token, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: jobs, error } = await admin
    .from('ota_sync_queue')
    .select('id, hotel_id, connection_id, provider, direction, type, attempts')
    .eq('provider', 'airbnb')
    .in('status', ['pending', 'retry'])
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let processed = 0;
  let failed = 0;

  for (const job of jobs || []) {
    const started = Date.now();
    await admin.from('ota_sync_queue').update({ status: 'processing', attempts: Number(job.attempts || 0) + 1, updated_at: new Date().toISOString() }).eq('id', job.id);

    try {
      await admin.from('ota_sync_logs').insert({
        hotel_id: job.hotel_id,
        connection_id: job.connection_id,
        provider: 'airbnb',
        direction: job.direction,
        status: 'worker_success',
        payload: { queue_id: job.id, type: job.type, worker: 'airbnb' },
        duration_ms: Date.now() - started,
      });
      await admin.from('ota_sync_queue').update({ status: 'done', processed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', job.id);
      processed += 1;
    } catch (e) {
      failed += 1;
      const attempts = Number(job.attempts || 0) + 1;
      const nextStatus = attempts >= 5 ? 'failed' : 'retry';
      await admin.from('ota_sync_queue').update({ status: nextStatus, last_error: e instanceof Error ? e.message : 'Unknown error', updated_at: new Date().toISOString() }).eq('id', job.id);
      await admin.from('ota_sync_logs').insert({
        hotel_id: job.hotel_id,
        connection_id: job.connection_id,
        provider: 'airbnb',
        direction: job.direction,
        status: nextStatus,
        errors: { message: e instanceof Error ? e.message : String(e) },
        duration_ms: Date.now() - started,
      });
    }
  }

  return NextResponse.json({ success: true, provider: 'airbnb', processed, failed });
}

export async function GET(request: Request) { return runWorker(request); }
export async function POST(request: Request) { return runWorker(request); }
