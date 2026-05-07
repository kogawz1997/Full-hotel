import { createAdminClient } from '@/lib/supabase/server';
import { getPlan } from '@/lib/billing/plans';

export type UsageMetricKey = 'hotels' | 'rooms' | 'staff' | 'ai_messages' | 'ota_channels' | 'storage_mb';

export async function getOrganizationUsage(organizationId: string) {
  const supabase = createAdminClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, subscription_plan, subscription_status, trial_ends_at, created_at')
    .eq('id', organizationId)
    .single();

  const plan = getPlan(org?.subscription_plan);
  const { data: hotels } = await supabase.from('hotels').select('id, name').eq('organization_id', organizationId);
  const hotelIds = (hotels || []).map((h: any) => h.id);

  const [rooms, staff, ota, errors] = await Promise.all([
    hotelIds.length ? supabase.from('rooms').select('*', { count: 'exact', head: true }).in('hotel_id', hotelIds) : Promise.resolve({ count: 0 }),
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
    hotelIds.length ? supabase.from('channel_connections').select('*', { count: 'exact', head: true }).in('hotel_id', hotelIds).eq('status', 'active') : Promise.resolve({ count: 0 }),
    hotelIds.length ? supabase.from('operational_events').select('*', { count: 'exact', head: true }).in('hotel_id', hotelIds).in('severity', ['error','critical']) : Promise.resolve({ count: 0 }),
  ] as any);

  let aiMessages = 0;
  if (hotelIds.length) {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('ai_generated', true);
    aiMessages = count || 0;
  }

  const values = {
    hotels: hotels?.length || 0,
    rooms: rooms.count || 0,
    staff: staff.count || 0,
    ai_messages: aiMessages,
    ota_channels: ota.count || 0,
    storage_mb: 0,
  };

  const limits: Record<UsageMetricKey, number | 'custom'> = {
    hotels: plan.limits.hotels,
    rooms: plan.limits.rooms,
    staff: plan.limits.staff,
    ai_messages: plan.key === 'starter' ? 100 : plan.key === 'standard' ? 1000 : plan.key === 'pro' ? 10000 : 'custom',
    ota_channels: plan.key === 'starter' ? 0 : plan.key === 'standard' ? 3 : plan.key === 'pro' ? 12 : 'custom',
    storage_mb: plan.key === 'starter' ? 1024 : plan.key === 'standard' ? 5120 : plan.key === 'pro' ? 51200 : 'custom',
  };

  return {
    organization: org,
    plan: plan.key,
    values,
    limits,
    errors: errors.count || 0,
    hotels: hotels || [],
    generatedAt: new Date().toISOString(),
  };
}
