export type BillingPlanKey = 'starter' | 'standard' | 'pro' | 'enterprise';
export type BillingPlan = { key: BillingPlanKey; name: string; monthlyPrice: number; currency: 'THB' | 'USD'; stripePriceEnv?: string; features: string[]; limits: { hotels: number | 'custom'; rooms: number | 'custom'; staff: number | 'custom' } };
export const BILLING_PLANS: BillingPlan[] = [
  { key: 'starter', name: 'Starter', monthlyPrice: 1490, currency: 'THB', stripePriceEnv: 'STRIPE_PRICE_STARTER', features: ['Core PMS','Reservations','Housekeeping','Guest portal'], limits: { hotels: 1, rooms: 30, staff: 5 } },
  { key: 'standard', name: 'Standard', monthlyPrice: 2990, currency: 'THB', stripePriceEnv: 'STRIPE_PRICE_STANDARD', features: ['Everything in Starter','Channel inbox','Reports','Team roles'], limits: { hotels: 2, rooms: 80, staff: 15 } },
  { key: 'pro', name: 'Pro', monthlyPrice: 5990, currency: 'THB', stripePriceEnv: 'STRIPE_PRICE_PRO', features: ['Everything in Standard','F&B / Spa modules','Automation','Priority support'], limits: { hotels: 5, rooms: 250, staff: 50 } },
  { key: 'enterprise', name: 'Enterprise', monthlyPrice: 0, currency: 'THB', stripePriceEnv: 'STRIPE_PRICE_ENTERPRISE', features: ['Custom contract','Dedicated onboarding','Custom integrations','SLA'], limits: { hotels: 'custom', rooms: 'custom', staff: 'custom' } },
];
export function getPlan(key: string | null | undefined) { return BILLING_PLANS.find((plan) => plan.key === key) || BILLING_PLANS[0]; }
export function getStripePriceId(planKey: string) { const plan = getPlan(planKey); return plan.stripePriceEnv ? process.env[plan.stripePriceEnv] || null : null; }
