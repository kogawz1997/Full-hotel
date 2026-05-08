#!/usr/bin/env node

const baseUrl = process.env.CRON_MONITOR_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
const cronSecret = process.env.CRON_SECRET;

if (!baseUrl) {
  console.error('Missing CRON_MONITOR_BASE_URL (or NEXT_PUBLIC_APP_URL)');
  process.exit(1);
}
if (!cronSecret) {
  console.error('Missing CRON_SECRET');
  process.exit(1);
}

const routes = [
  '/api/cron/night-audit',
  '/api/cron/reliability-sweep',
  '/api/cron/daily-summary',
];

let ok = 0;
for (const route of routes) {
  const url = `${baseUrl}${route}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'x-cron-secret': cronSecret },
    });
    if (res.ok) {
      ok += 1;
      console.log(`OK  ${route} -> ${res.status}`);
    } else {
      console.log(`ERR ${route} -> ${res.status}`);
    }
  } catch (error) {
    console.log(`ERR ${route} -> ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (ok !== routes.length) process.exit(2);
console.log(`All cron monitor checks passed (${ok}/${routes.length})`);
