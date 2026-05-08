import fs from 'node:fs';
import path from 'node:path';

function read(rel) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
}

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

const readiness = read('src/app/api/ops/readiness/route.ts');
if (!readiness.includes("timed('audit_logs'")) fail('readiness route missing audit_logs check');
if (!readiness.includes('deriveReadinessStatus(checks)')) fail('readiness route must derive tri-state status from helper');

const readinessHelper = read('src/lib/ops/readiness-status.ts');
if (!readinessHelper.includes("'degraded'")) fail('readiness helper missing degraded status branch');
if (!readinessHelper.includes("'audit_logs'")) fail('readiness helper missing audit_logs db check');

const search = read('src/app/api/public/search/route.ts');
if (!search.includes('catch (error: unknown)')) fail('search route missing fallback catch');
if (!search.includes('warning: error instanceof Error ? error.message :')) fail('search route missing warning fallback payload');

const billing = read('src/app/api/billing/route.ts');
if (!billing.includes('status: 401')) fail('billing route missing unauthenticated 401 response');

console.log('✅ go-live hardening regression checks passed');
