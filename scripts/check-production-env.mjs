/**
 * Production environment variable checker
 * Run: node scripts/check-production-env.mjs
 * Or:  npm run check:env
 */

const required = [
  ['NEXT_PUBLIC_SUPABASE_URL',      'Supabase → Project Settings → API'],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase → Project Settings → API'],
  ['SUPABASE_SERVICE_ROLE_KEY',     'Supabase → Project Settings → API'],
  ['NEXT_PUBLIC_APP_URL',           'Your production domain: https://yourdomain.com'],
  ['CRON_SECRET',                   'Generate: openssl rand -hex 32'],
];

const recommended = [
  ['ANTHROPIC_API_KEY',           'console.anthropic.com → AI features'],
  ['SENDGRID_API_KEY',            'sendgrid.com → Email delivery'],
  ['SENDGRID_FROM_EMAIL',         'Verified sender email'],
  ['STRIPE_SECRET_KEY',           'stripe.com → Subscription billing'],
  ['STRIPE_WEBHOOK_SECRET',       'stripe.com → Webhook signing secret'],
  ['STRIPE_PRICE_STARTER',        'Stripe product price ID for Starter plan'],
  ['STRIPE_PRICE_STANDARD',       'Stripe product price ID for Standard plan'],
  ['STRIPE_PRICE_PRO',            'Stripe product price ID for Pro plan'],
  ['UPSTASH_REDIS_REST_URL',      'upstash.com → Redis rate limiting'],
  ['UPSTASH_REDIS_REST_TOKEN',    'upstash.com → Redis rate limiting'],
  ['SENTRY_DSN',                  'sentry.io → Error monitoring'],
  ['LINE_CHANNEL_ACCESS_TOKEN',   'LINE Developers → Messaging API'],
  ['LINE_CHANNEL_SECRET',         'LINE Developers → Messaging API'],
];

const optional = [
  ['OMISE_SECRET_KEY',            'omise.co → Payments (Thailand)'],
  ['WHATSAPP_ACCESS_TOKEN',       'Meta → WhatsApp Business API'],
  ['ETAX_USERNAME',               'INET eTax → Thai e-invoice'],
  ['IMMIGRATION_API_KEY',         'immigration.go.th → TM30'],
];

let failed = false;
let warnings = 0;

console.log('\n🔍 Maitri Production Environment Check\n');
console.log('━'.repeat(50));

console.log('\n✅ REQUIRED (app will not work without these):');
for (const [key, hint] of required) {
  const val = process.env[key];
  if (!val) {
    console.log(`  ❌ ${key}`);
    console.log(`     How to get: ${hint}`);
    failed = true;
  } else {
    const preview = val.length > 20 ? val.slice(0, 8) + '...' + val.slice(-4) : val;
    console.log(`  ✓  ${key} = ${preview}`);
  }
}

console.log('\n⚡ RECOMMENDED (degraded features without these):');
for (const [key, hint] of recommended) {
  const val = process.env[key];
  if (!val) {
    console.log(`  ⚠️  ${key} — MISSING`);
    console.log(`     ${hint}`);
    warnings++;
  } else {
    console.log(`  ✓  ${key}`);
  }
}

console.log('\n🔧 OPTIONAL (extra integrations):');
for (const [key] of optional) {
  const val = process.env[key];
  console.log(`  ${val ? '✓ ' : '○ '} ${key}`);
}

console.log('\n━'.repeat(50));
if (failed) {
  console.log(`\n❌ ${required.filter(([k]) => !process.env[k]).length} required vars missing — fix before deploying!\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n⚠️  ${warnings} recommended vars missing — some features will be disabled.`);
  console.log('   See PRODUCTION_SETUP.md for setup instructions.\n');
} else {
  console.log('\n✅ All environment variables configured. Ready for production! 🚀\n');
}
