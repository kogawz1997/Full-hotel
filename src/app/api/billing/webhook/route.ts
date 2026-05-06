/**
 * Stripe Webhook Handler
 * Receives events from Stripe and updates subscription status in DB
 *
 * Setup in Stripe Dashboard:
 *   Developers → Webhooks → Add endpoint
 *   URL: https://yourdomain.com/api/billing/webhook
 *   Events: checkout.session.completed, customer.subscription.updated,
 *           customer.subscription.deleted, invoice.payment_failed,
 *           invoice.payment_succeeded
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyStripeSignature } from '@/lib/billing/stripe';
import { sendOpsAlert } from '@/lib/ops/alerts';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!verifyStripeSignature(rawBody, signature)) {
    console.error('[Stripe Webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: any;
  try { event = JSON.parse(rawBody); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotency
  const eventId = event?.id;
  if (eventId) {
    const { data: dup } = await admin.from('audit_logs')
      .select('id').eq('action', 'webhook.stripe').eq('entity_id', eventId).single();
    if (dup) return NextResponse.json({ received: true, duplicate: true });
    await admin.from('audit_logs').insert({
      action: 'webhook.stripe', entity_type: 'billing', entity_id: eventId,
      changes: { event_type: event?.type },
    });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orgId = session.metadata?.organization_id;
        const plan  = session.metadata?.plan || 'starter';
        if (orgId) {
          await admin.from('organizations').update({
            subscription_plan: plan,
            subscription_status: 'active',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            trial_ends_at: null,
          }).eq('id', orgId);
          console.log(`[Stripe] Checkout complete: org=${orgId} plan=${plan}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub    = event.data.object;
        const custId = sub.customer;
        const status = sub.status; // active, past_due, canceled, etc.
        const plan   = sub.metadata?.plan;
        const { data: orgs } = await admin.from('organizations')
          .select('id').eq('stripe_customer_id', custId);
        if (orgs?.[0]) {
          await admin.from('organizations').update({
            subscription_status: status,
            ...(plan && { subscription_plan: plan }),
          }).eq('stripe_customer_id', custId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub    = event.data.object;
        const custId = sub.customer;
        await admin.from('organizations').update({
          subscription_status: 'cancelled',
          subscription_plan: 'starter',
        }).eq('stripe_customer_id', custId);
        console.log(`[Stripe] Subscription cancelled: customer=${custId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const custId  = invoice.customer;
        await admin.from('organizations').update({
          subscription_status: 'past_due',
        }).eq('stripe_customer_id', custId);
        await sendOpsAlert({
          level: 'critical',
          title: 'Stripe invoice payment failed',
          message: `Subscription invoice payment failed for customer ${custId}.`,
          context: { customer_id: custId, invoice_id: invoice.id, amount_due: invoice.amount_due },
        });
        await admin.from('operational_events').insert({
          event_type: 'billing.invoice.payment_failed',
          severity: 'critical',
          title: 'Stripe invoice payment failed',
          details: { customer_id: custId, invoice_id: invoice.id, amount_due: invoice.amount_due },
          source: 'stripe-webhook',
        });
        console.warn(`[Stripe] Payment failed: customer=${custId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const custId  = invoice.customer;
        await admin.from('organizations').update({
          subscription_status: 'active',
        }).eq('stripe_customer_id', custId);
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }
  } catch (err: any) {
    console.error('[Stripe Webhook] Handler error:', err.message);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
