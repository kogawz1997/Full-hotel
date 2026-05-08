#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const base = process.env.BASE_URL || 'http://localhost:3000';
const outputDir = process.env.OUT_DIR || 'docs/operations/evidence';
const outFile = process.env.OUT_FILE || '';
const latestFile = process.env.LATEST_FILE || 'docs/operations/GO_LIVE_EVIDENCE_LATEST.md';
const strict = process.env.STRICT === 'true';
const timeoutMs = Number(process.env.TIMEOUT_MS || 45000);
const authHeader = process.env.AUTH_HEADER || '';
const authToken = process.env.AUTH_TOKEN || '';
const requestHeaders = authHeader && authToken ? { [authHeader]: authToken } : {};

async function hit(path, expected = 200) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}${path}`, { signal: controller.signal, headers: requestHeaders });
    const ms = Date.now() - started;
    clearTimeout(timer);
    return { path, ok: res.status === expected, expected, status: res.status, ms };
  } catch (error) {
    const ms = Date.now() - started;
    clearTimeout(timer);
    const message = error instanceof Error ? error.message : 'fetch failed';
    return { path, ok: false, expected, status: null, ms, error: message };
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
const safeTs = now.replace(/[:]/g, '-');
const outputFile = outFile || path.join(outputDir, `GO_LIVE_EVIDENCE_${safeTs}.md`);

const lines = [];
lines.push('# Go-live Evidence Snapshot');
lines.push('');
lines.push(`- Generated at (UTC): ${now}`);
lines.push(`- Base URL: ${base}`);
lines.push(`- Timeout per check: ${timeoutMs}ms`);
lines.push(`- Auth header used: ${authHeader ? authHeader : 'none'}`);
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

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${lines.join('\n')}\n`);
fs.mkdirSync(path.dirname(latestFile), { recursive: true });
fs.writeFileSync(latestFile, `${lines.join('\n')}\n`);
console.log(`Evidence written to ${outputFile}`);
console.log(`Latest snapshot updated at ${latestFile}`);
console.log(`Summary: ${pass}/${checks.length} passed`);
if (fail > 0 && strict) process.exit(1);
