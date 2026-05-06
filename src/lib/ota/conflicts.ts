import { createAdminClient } from '@/lib/supabase/server';

export async function registerOtaReservationEvent(input: {
  hotelId: string;
  provider: string;
  externalReservationId: string;
  payload: Record<string, any>;
}) {
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from('ota_reservation_events')
    .select('*')
    .eq('hotel_id', input.hotelId)
    .eq('provider', input.provider)
    .eq('external_reservation_id', input.externalReservationId)
    .maybeSingle();

  if (existing) {
    await supabase.from('ota_reservation_events').update({
      last_seen_at: new Date().toISOString(),
      duplicate_count: Number(existing.duplicate_count || 0) + 1,
      payload: input.payload,
    }).eq('id', existing.id);
    return { status: 'duplicate' as const, event: existing };
  }

  const { data: event, error } = await supabase.from('ota_reservation_events').insert({
    hotel_id: input.hotelId,
    provider: input.provider,
    external_reservation_id: input.externalReservationId,
    status: 'received',
    payload: input.payload,
  }).select('*').single();

  if (error) throw new Error(error.message);
  return { status: 'new' as const, event };
}
