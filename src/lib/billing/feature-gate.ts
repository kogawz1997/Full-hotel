/**
 * Feature Gate — enforce plan limits
 * Use in API routes and page components
 *
 * Usage in API:
 *   const gate = await checkFeatureGate(orgId, 'ai_inbox');
 *   if (!gate.allowed) return NextResponse.json({ error: gate.reason, upgrade: gate.upgrade }, { status: 402 });
 *
 * Usage in components:
 *   const { allowed, plan } = useFeatureGate('channel_manager');
 *   if (!allowed) return <UpgradePrompt feature="Channel Manager" requiredPlan="standard" />;
 */
import { createAdminClient } from '@/lib/supabase/server';
import { getPlan, BILLING_PLANS, type BillingPlanKey } from './plans';

export type FeatureKey =
  | 'core_pms'          // All plans
  | 'guest_portal'      // All plans
  | 'ai_inbox'          // Standard+
  | 'channel_manager'   // Standard+
  | 'reports_export'    // Standard+
  | 'team_roles'        // Standard+
  | 'fb_module'         // Pro+
  | 'spa_module'        // Pro+
  | 'automation'        // Pro+
  | 'dynamic_pricing'   // Pro+
  | 'multi_property'    // Pro+
  | 'api_access'        // Pro+
  | 'white_label'       // Enterprise
  | 'custom_domain'     // Enterprise
  | 'revenue_manager'   // Pro+
  | 'iot_management'    // Pro+
  | 'mobile_key'        // Pro+;

const FEATURE_PLAN_MAP: Record<FeatureKey, BillingPlanKey> = {
  core_pms:        'starter',
  guest_portal:    'starter',
  ai_inbox:        'standard',
  channel_manager: 'standard',
  reports_export:  'standard',
  team_roles:      'standard',
  fb_module:       'pro',
  spa_module:      'pro',
  automation:      'pro',
  dynamic_pricing: 'pro',
  multi_property:  'pro',
  api_access:      'pro',
  revenue_manager: 'pro',
  iot_management:  'pro',
  mobile_key:      'pro',
  white_label:     'enterprise',
  custom_domain:   'enterprise',
};

const PLAN_ORDER: BillingPlanKey[] = ['starter', 'standard', 'pro', 'enterprise'];

function planRank(plan: BillingPlanKey): number {
  return PLAN_ORDER.indexOf(plan);
}

function meetsRequirement(currentPlan: BillingPlanKey, requiredPlan: BillingPlanKey): boolean {
  return planRank(currentPlan) >= planRank(requiredPlan);
}

interface GateResult {
  allowed: boolean;
  plan: BillingPlanKey;
  requiredPlan?: BillingPlanKey;
  reason?: string;
  upgrade?: { plan: BillingPlanKey; name: string };
}

export async function checkFeatureGate(organizationId: string, feature: FeatureKey): Promise<GateResult> {
  const admin = createAdminClient();

  const { data: org } = await admin
    .from('organizations')
    .select('subscription_plan, subscription_status, trial_ends_at')
    .eq('id', organizationId)
    .single();

  const currentPlan = (org?.subscription_plan || 'starter') as BillingPlanKey;
  const status = org?.subscription_status || 'active';

  // Check if subscription is active (allow trial)
  const trialActive = org?.trial_ends_at && new Date(org.trial_ends_at) > new Date();
  const subscriptionActive = ['active', 'trialing'].includes(status) || trialActive;

  if (!subscriptionActive && currentPlan !== 'starter') {
    return {
      allowed: false,
      plan: currentPlan,
      reason: 'Subscription expired or payment required',
      upgrade: { plan: currentPlan, name: getPlan(currentPlan).name },
    };
  }

  const requiredPlan = FEATURE_PLAN_MAP[feature];
  const allowed = meetsRequirement(currentPlan, requiredPlan);

  if (!allowed) {
    const upgradePlan = BILLING_PLANS.find(p => planRank(p.key) >= planRank(requiredPlan));
    return {
      allowed: false,
      plan: currentPlan,
      requiredPlan,
      reason: `Feature "${feature}" requires ${getPlan(requiredPlan).name} plan or higher`,
      upgrade: upgradePlan ? { plan: upgradePlan.key, name: upgradePlan.name } : undefined,
    };
  }

  return { allowed: true, plan: currentPlan };
}

// Check usage limits (rooms, hotels, staff)
export async function checkUsageLimit(
  organizationId: string,
  limitType: 'rooms' | 'hotels' | 'staff'
): Promise<GateResult & { current: number; limit: number | 'custom' }> {
  const admin = createAdminClient();

  const { data: org } = await admin
    .from('organizations')
    .select('subscription_plan')
    .eq('id', organizationId)
    .single();

  const plan = getPlan(org?.subscription_plan);
  const limit = plan.limits[limitType];

  if (limit === 'custom') {
    return { allowed: true, plan: plan.key, current: 0, limit };
  }

  // Count current usage
  let current = 0;
  if (limitType === 'hotels') {
    const { count } = await admin.from('hotels').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId);
    current = count || 0;
  } else if (limitType === 'rooms') {
    const { data: hotels } = await admin.from('hotels').select('id').eq('organization_id', organizationId);
    const hotelIds = hotels?.map(h => h.id) || [];
    if (hotelIds.length > 0) {
      const { count } = await admin.from('rooms').select('*', { count: 'exact', head: true }).in('hotel_id', hotelIds);
      current = count || 0;
    }
  } else if (limitType === 'staff') {
    const { count } = await admin.from('user_profiles').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('active', true);
    current = count || 0;
  }

  if (current >= limit) {
    const nextPlan = BILLING_PLANS.find(p => {
      const l = p.limits[limitType];
      return l === 'custom' || (typeof l === 'number' && l > (limit as number));
    });
    return {
      allowed: false,
      plan: plan.key,
      current,
      limit,
      reason: `${limitType} limit reached (${current}/${limit})`,
      upgrade: nextPlan ? { plan: nextPlan.key, name: nextPlan.name } : undefined,
    };
  }

  return { allowed: true, plan: plan.key, current, limit };
}
