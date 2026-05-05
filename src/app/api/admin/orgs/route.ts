import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/auth/guards';

export async function GET() {
  const ctx = await requirePlatformAdmin();
  if (ctx.error) return ctx.error;
  const { data } = await ctx.supabase.from('organizations')
    .select('*, hotels(count), user_profiles(count)').order('created_at', { ascending: false });
  return NextResponse.json({ orgs: data || [] });
}

export async function PATCH(request: NextRequest) {
  const ctx = await requirePlatformAdmin();
  if (ctx.error) return ctx.error;
  const { orgId, action, plan } = await request.json();

  if (action === 'suspend') {
    await ctx.supabase.from('organizations').update({ subscription_status: 'cancelled' }).eq('id', orgId);
    await ctx.supabase.from('audit_logs').insert({
      action: 'admin.suspend_org', entity_type: 'organization', entity_id: orgId,
      changes: { suspended_by: 'platform_admin', at: new Date().toISOString() },
    });
  } else if (action === 'reactivate') {
    await ctx.supabase.from('organizations').update({ subscription_status: 'active' }).eq('id', orgId);
  } else if (action === 'change_plan' && plan) {
    await ctx.supabase.from('organizations').update({ subscription_plan: plan }).eq('id', orgId);
  }

  return NextResponse.json({ success: true });
}
