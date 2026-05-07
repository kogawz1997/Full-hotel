# Maitri PMS Deployment Matrix

อัปเดตล่าสุด: 2026-05-07

โปรเจคนี้ถูกคลีนให้เหลือ production path หลักเป็น **Vercel + Next.js 15 + Supabase** เท่านั้น เพื่อไม่ให้ config หลายแพลตฟอร์มตีกันเองตอน deploy

## Target หลัก

| Purpose | Target | Notes |
|---|---|---|
| Production web app | Vercel | ใช้ `vercel.json`, Node 20.x, `npm ci`, `npm run build` |
| Database/Auth/Storage | Supabase | ต้องตั้ง env ให้ครบใน Vercel |
| Email | SendGrid หรือ provider ที่ตั้งใน env | ใช้กับ confirmation/reset/notification |
| Monitoring | Sentry | optional แต่แนะนำก่อนรับเงินจริง |
| Rate limit/cache | Upstash Redis | optional แต่ควรเปิด production |

## Local testing

### Windows PowerShell

```powershell
Copy-Item .env.production.example .env.local
notepad .env.local
npm ci
npm run type-check
npm run build
npm run check
```

### macOS/Linux

```bash
cp .env.production.example .env.local
nano .env.local
npm ci
npm run type-check
npm run build
npm run check
```

## Files ที่ใช้ deploy จริง

| File | ใช้ทำอะไร |
|---|---|
| `vercel.json` | cron + install/build command |
| `package.json` | scripts/dependencies/runtime |
| `package-lock.json` | lock dependency สำหรับ `npm ci` |
| `.env.production.example` | template env production |
| `.github/workflows/ci.yml` | CI validation |
| `.github/workflows/deploy-check.yml` | deploy readiness validation |

## Required production environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
APP_URL=
CRON_SECRET=
```

Optional แต่ควรตั้งก่อน production จริง:

```bash
SENTRY_DSN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
OMISE_SECRET_KEY=
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=
```

## คำสั่งตรวจ deploy target

```bash
npm run deploy:check
```
