import fs from 'node:fs';

const required = [
  'vercel.json',
  'package.json',
  'package-lock.json',
  '.env.production.example',
  'scripts/deploy-local.sh',
  'scripts/deploy-local.ps1',
  '.github/workflows/ci.yml',
  '.github/workflows/deploy-check.yml',
  'docs/DEPLOYMENT_MATRIX.md',
];

let failed = false;
for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing ${file}`);
    failed = true;
  } else {
    console.log(`✅ ${file}`);
  }
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
for (const script of ['deploy:check', 'deploy:local', 'verify:deploy']) {
  if (!pkg.scripts?.[script]) {
    console.error(`❌ Missing package script: ${script}`);
    failed = true;
  }
}

const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
if (!Array.isArray(vercel.crons) || vercel.crons.length === 0) {
  console.error('❌ Vercel cron config missing');
  failed = true;
}
if (vercel.crons.some((cron) => cron.path === '/api/cron/trial-expiry')) {
  console.error('❌ Duplicate legacy cron /api/cron/trial-expiry should not be present');
  failed = true;
}
if (!vercel.crons.some((cron) => cron.path === '/api/cron/trial-expire')) {
  console.error('❌ Required cron /api/cron/trial-expire missing');
  failed = true;
}

if (failed) process.exit(1);
console.log('✅ Vercel deployment checks passed');
