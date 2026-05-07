# Cleanup Summary — 2026-05-07

## เป้าหมาย

คลีนโปรเจคให้เหลือไฟล์ที่ใช้จริงสำหรับ production path หลัก: **Next.js 15 + Supabase + Vercel**

## ลบออกแล้ว

### Deployment ทางเลือกที่ไม่ได้ใช้

- `.dockerignore`
- `Dockerfile`
- `docker-compose.yml`
- `deploy/`
- `ecosystem.config.cjs`
- `fly.toml`
- `koyeb.yaml`
- `nixpacks.toml`
- `railway.json`

### เอกสาร snapshot เก่าที่ซ้ำ

- `PHASE*_CLOSED.md`
- `ROUND*_CLOSED.md`
- `ROUND5_REALITY_CHECK.md`
- `DEPLOYMENT_TOOLKIT_ADDED.md`
- `MAITRI_HARDENING_SUMMARY.md`
- `PRODUCTION_PATCH_NOTES.md`

เอกสารหลักที่ยังอยู่: `README.md`, `ROADMAP.md`, `TODO.md`, `PRODUCTION_SETUP.md`, `SECURITY.md`, และ `docs/*`

### Config/Test placeholder ที่ไม่ตรง dependency

- `jest.config.ts`
- `playwright.config.ts`
- `tests/e2e/*.spec.ts`
- `tests/unit/*.test.ts` ที่ต้องใช้ Jest/Playwright แต่ไม่ได้ลงใน `package.json`

ยังเก็บ test `.mjs` ที่ถูกเรียกจาก npm scripts ไว้ครบ

### ไฟล์ซ้ำ

- `public/manifest.json`
- `src/app/api/cron/trial-expiry/route.ts`

## อัปเดตแล้ว

- `vercel.json`: ลบ cron ซ้ำ `/api/cron/trial-expiry`
- `package.json`: ลบ dev dependency `@types/nodemailer` ที่ไม่ได้ใช้
- `package-lock.json`: sync ตาม package.json
- `tsconfig.json`: ลบ exclude ของ config ที่ถูกลบแล้ว
- `README.md`: เพิ่มสถานะปัจจุบันและแก้ PWA manifest เป็น `public/manifest.webmanifest`
- `TODO.md`: เพิ่ม cleanup status และรายการที่ต้องตรวจใน production จริง

## Production path ที่เหลือ

- Deploy target: Vercel
- Runtime: Node 20.x
- Package manager: npm 10.9.x
- PWA manifest: `public/manifest.webmanifest`
- Cron trial: `/api/cron/trial-expire`

## คำสั่งตรวจหลังแตกไฟล์

```bash
npm ci
npm run type-check
npm run build
npm run check
```
