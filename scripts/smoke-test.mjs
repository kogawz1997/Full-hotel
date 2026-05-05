/**
 * Smoke Test — run after deploy to verify critical paths
 * Usage: BASE_URL=https://yourdomain.com node scripts/smoke-test.mjs
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const results = [];

async function check(name, fn) {
  try {
    const start = Date.now();
    await fn();
    const ms = Date.now() - start;
    results.push({ name, ok: true, ms });
    console.log(`  ✅ ${name} (${ms}ms)`);
  } catch (err) {
    results.push({ name, ok: false, error: err.message });
    console.log(`  ❌ ${name}: ${err.message}`);
  }
}

async function get(path, expectedStatus = 200) {
  const res = await fetch(`${BASE}${path}`);
  if (res.status !== expectedStatus) throw new Error(`Expected ${expectedStatus}, got ${res.status}`);
  return res;
}

async function post(path, body, expectedStatus = 200) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status !== expectedStatus) {
    const text = await res.text();
    throw new Error(`Expected ${expectedStatus}, got ${res.status}: ${text.slice(0, 100)}`);
  }
  return res;
}

console.log(`\n🧪 Smoke Test — ${BASE}\n`);

// ─── Public pages ────────────────────────────────────────────────────────
await check('Landing page loads',           () => get('/'));
await check('Search page loads',            () => get('/search'));
await check('Terms page loads',             () => get('/terms'));
await check('Privacy page loads',           () => get('/privacy'));
await check('Portal login page loads',      () => get('/portal/login'));

// ─── Health checks ───────────────────────────────────────────────────────
await check('Health endpoint',              () => get('/api/health'));
await check('Readiness endpoint',           () => get('/api/ops/readiness'));

// ─── API sanity ──────────────────────────────────────────────────────────
await check('Search API returns 200',       () => get('/api/public/search?city=Bangkok'));

// ─── Auth endpoints reject bad input ────────────────────────────────────
await check('Register rejects bad email',   () => post('/api/guest/auth/register', { email: 'notanemail', password: 'short' }, 400));
await check('Bookings require auth',        () => get('/api/guest/bookings', 401));
await check('Rate limit: AI chat',          async () => {
  // Just check it responds, not that it rate limits
  const res = await fetch(`${BASE}/api/public/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hotelId: 'test', message: 'hi' }) });
  if (res.status >= 500) throw new Error(`Server error: ${res.status}`);
});

// ─── Security checks ─────────────────────────────────────────────────────
await check('Admin API rejects no auth',    () => get('/api/team', 401));
await check('Billing rejects no auth',      () => get('/api/billing/portal', 401));

// ─── Summary ─────────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length;
const failed = results.filter(r => !r.ok).length;
const avgMs  = Math.round(results.filter(r => r.ms).reduce((s, r) => s + r.ms, 0) / results.filter(r => r.ms).length);

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed · avg ${avgMs}ms`);
if (failed > 0) {
  console.log('\nFailed tests:');
  results.filter(r => !r.ok).forEach(r => console.log(`  ❌ ${r.name}: ${r.error}`));
  process.exit(1);
} else {
  console.log('\n✅ All smoke tests passed!');
}
