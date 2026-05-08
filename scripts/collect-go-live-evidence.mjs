#!/usr/bin/env node
import fs from 'node:fs';

const base = process.env.BASE_URL || 'http://localhost:3000';
const out = process.env.OUT_FILE || 'docs/operations/GO_LIVE_EVIDENCE_LATEST.md';
const strict = process.env.STRICT === 'true';

async function hit(path, expected = 200) {
  const started = Date.now();
  try {
    const res = await fetch(`${base}${path}`);
    const ms = Date.now() - started;
    return { path, ok: res.status === expected, expected, status: res.status, ms };
  } catch (error) {
    const ms = Date.now() - started;
    return { path, ok: false, expected, status: null, ms, error: error instanceof Error ? error.message : 'fetch failed' };
  }
}

const checks = [
  await hit('/api/health', 200),
  await hit('/api/ops/readiness', 200),
  await hit('/api/public/search?city=Bangkok', 200),
  await hit('/api/billing/portal', 401),
];

const pass = checks.filter(c => c.ok).length;
const fail = checks.length - pass;
const now = new Date().toISOString();

const lines = [];
lines.push('# Go-live Evidence Snapshot');
lines.push('');
lines.push(`- Generated at (UTC): ${now}`);
lines.push(`- Base URL: ${base}`);
lines.push(`- Summary: ${pass}/${checks.length} passed, ${fail} failed`);
lines.push('');
lines.push('| Check | Expected | Actual | Result | Latency |');
lines.push('|---|---:|---:|---|---:|');
for (const c of checks) {
  const result = c.ok ? '✅ PASS' : '❌ FAIL';
  const actual = c.status ?? 'ERR';
  lines.push(`| \`${c.path}\` | ${c.expected} | ${actual} | ${result} | ${c.ms}ms |`);
  if (c.error) lines.push(`| ↳ error | - | - | ${c.error} | - |`);
}

lines.push('');
lines.push('## Next action');
if (fail === 0) {
  lines.push('- สามารถแนบไฟล์นี้ใน deployment sign-off ได้ทันที');
} else {
  lines.push('- ยังมี endpoint ที่ไม่ผ่าน ให้แก้แล้วรันซ้ำก่อน sign-off');
}

fs.mkdirSync(out.split('/').slice(0, -1).join('/'), { recursive: true });
fs.writeFileSync(out, `${lines.join('\n')}\n`);
console.log(`Evidence written to ${out}`);
console.log(`Summary: ${pass}/${checks.length} passed`);
if (fail > 0 && strict) process.exit(1);
