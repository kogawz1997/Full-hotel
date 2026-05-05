const envChecks = [
  ['NEXT_PUBLIC_APP_URL', v => v?.startsWith('https://'), 'must be production https URL'],
  ['NEXT_PUBLIC_SUPABASE_URL', Boolean, 'required'],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', Boolean, 'required'],
  ['SUPABASE_SERVICE_ROLE_KEY', Boolean, 'required'],
  ['STRIPE_SECRET_KEY', v => v?.startsWith('sk_live_'), 'must be Stripe live key'],
  ['STRIPE_WEBHOOK_SECRET', v => v?.startsWith('whsec_'), 'required webhook signing secret'],
  ['CRON_SECRET', Boolean, 'required'],
];

let failed = false;
for (const [key, test, note] of envChecks) {
  const ok = test(process.env[key]);
  console.log(`${ok ? '✅' : '❌'} ${key} ${ok ? '' : `- ${note}`}`);
  if (!ok) failed = true;
}

if (!process.env.OPS_ALERT_WEBHOOK_URL && !process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
  console.warn('⚠️ Monitoring alert is not configured. Set OPS_ALERT_WEBHOOK_URL or Sentry DSN before real customers.');
}

if (failed) process.exit(1);
console.log('✅ Go-live env checks passed. Now run the real user flow manually before taking money. Because apparently software needs reality checks.');
