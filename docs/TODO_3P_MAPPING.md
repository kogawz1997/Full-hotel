# TODO → 3P One-to-One Mapping

อัปเดต: 2026-05-08

งานคงค้างทั้งหมดใน mapping นี้: 1 งาน (Email verification production check)

## P2 — Core Booking & UX (0 งานค้าง)

- [x] **ซ่อน OTA channels ที่ยังไม่พร้อม** ออกจาก UI ลูกค้า  <!-- TODO.md:L188 -->
- [x] **เพิ่ม disclaimer** ใน channel settings: "การเชื่อมต่อ OTA ต้องการ API credentials จาก vendor โดยตรง"  <!-- TODO.md:L194 -->
- [x] **OTA sync cron** — เพิ่ม early return ถ้าไม่มี `channel.api_key` พร้อม log ที่ชัดเจน  <!-- TODO.md:L195 -->
- [x] แยกให้ชัดใน docs ว่า OTA ไหน "พร้อมใช้" vs "รอ vendor approval"  <!-- TODO.md:L196 -->

## P2 — Core Booking & UX (0 งานค้าง)

- [x] **Room type images** → แก้ `src/components/dashboard/rooms-client.tsx` + upload API  <!-- TODO.md:L16 -->
- [x] **Pay at hotel** → แก้ booking-engine.tsx เพิ่ม payment method option  <!-- TODO.md:L18 -->
- [x] **QR check-in** → สร้าง `src/app/portal/bookings/qr/page.tsx`  <!-- TODO.md:L44 -->
- [x] **Hotel public page** — Airbnb-style gallery grid + sticky sidebar  <!-- TODO.md:L67 -->
- [x] **Booking engine** — animated step progress, trust badges  <!-- TODO.md:L68 -->
- [x] **Search page** — Map/List toggle, infinite scroll, compare mode  <!-- TODO.md:L69 -->
- [x] **Global page transitions** — page-enter animation  <!-- TODO.md:L70 -->
- [x] **Loading skeletons** — ทุก async section  <!-- TODO.md:L71 -->
- [x] PromptPay QR ใน payment flow  <!-- TODO.md:L227 -->

## P3 — Scale/SEO/Growth (1 งานค้าง)

- [ ] **Email verification** → ต้อง verify สถานะจริงใน Supabase production environment  <!-- TODO.md:L10 -->
- [x] **Subscription billing** → สร้าง `src/app/dashboard/billing/page.tsx` + Stripe integration  <!-- TODO.md:L30 -->
- [x] **Data export PDPA** → สร้าง `src/app/api/guest/export/route.ts`  <!-- TODO.md:L32 -->
- [x] **Redis rate limit** → แก้ `src/lib/security/rate-limit.ts` → Upstash  <!-- TODO.md:L34 -->
- [x] **PWA manifest** → สร้าง `public/manifest.json` + icons  <!-- TODO.md:L35 -->
- [x] **OpenGraph images** → สร้าง `src/app/h/[slug]/opengraph-image.tsx`  <!-- TODO.md:L36 -->
- [x] **F&B POS** → สร้าง `src/app/dashboard/fb/menu/`, `fb/orders/`  <!-- TODO.md:L40 -->
- [x] **Spa booking** → สร้าง `src/app/dashboard/spa/services/`, `spa/bookings/`  <!-- TODO.md:L41 -->
- [x] **Maintenance** → สร้าง `src/app/dashboard/maintenance/page.tsx`  <!-- TODO.md:L42 -->
- [x] **Image optimization** → สร้าง `src/app/api/storage/optimize/route.ts` (sharp)  <!-- TODO.md:L45 -->
- [x] Destination cards section — Bangkok, Chiang Mai, Phuket, Samui (ดึงจาก DB หรือ static)  <!-- TODO.md:L220 -->
- [x] Featured hotels section — top rated จาก DB  <!-- TODO.md:L221 -->
- [x] "ทำไมต้องจองกับเรา" section — trust signals  <!-- TODO.md:L222 -->
- [x] `src/components/public/HotelCard.tsx` — ย้าย HotelCard ออกจาก search/page.tsx  <!-- TODO.md:L225 -->
- [x] Swipe gallery บน mobile (touch/pointer events)  <!-- TODO.md:L238 -->
- [x] Recently viewed hotels (localStorage + sync)  <!-- TODO.md:L239 -->
- [x] AI-based recommended hotels  <!-- TODO.md:L240 -->
- [x] Compare hotels feature (2-3 โรงแรม side-by-side)  <!-- TODO.md:L241 -->
- [x] Last-minute deals section  <!-- TODO.md:L242 -->
- [x] Pre-stay direct message to hotel  <!-- TODO.md:L243 -->

## P0 — Payment Hardening (อัปเดตล่าสุด)

- [x] **Webhook verification จริง** (Stripe signature + require webhook secret)  <!-- TODO.md:L261 -->
- [x] **Payment retry follow-up** (`/api/cron/billing-retry`)  <!-- TODO.md:L262 -->
- [x] **Duplicate payment protection** (Stripe/Omise idempotency)  <!-- TODO.md:L263 -->
- [x] **Chargeback status tracking** (`charge.dispute.created/closed`)  <!-- TODO.md:L266 -->
- [x] **Payment timeout handling** (`/api/cron/expire-pending`)  <!-- TODO.md:L267 -->
- [x] **Reconcile jobs** (`/api/cron/billing-reconcile`)  <!-- TODO.md:L268 -->
- [x] **Refund flow** (`/api/payments/refund`)  <!-- TODO.md:L264 -->
- [x] **Partial refund** (amount-based partial/full refund status)  <!-- TODO.md:L265 -->

## P1 — OTA / Channel Manager (ความคืบหน้าล่าสุด)

- [x] **Retry queue** (`ota_sync_queue` statuses: pending/retry/failed + attempts cap)  <!-- TODO.md:L293 -->
- [x] **Conflict resolution** (duplicate reservation tracking via `ota_reservation_events`)  <!-- TODO.md:L294 -->
- [ ] Booking.com sync worker  <!-- TODO.md:L290 -->
- [ ] Agoda sync worker  <!-- TODO.md:L291 -->
- [ ] Airbnb sync worker  <!-- TODO.md:L292 -->
- [ ] rate limit handling  <!-- TODO.md:L295 -->
- [ ] webhook sync  <!-- TODO.md:L296 -->
- [ ] inventory reconciliation  <!-- TODO.md:L297 -->

## P0 — Reservation Safety (ความคืบหน้าล่าสุด)

- [ ] overbooking prevention test จริง  <!-- TODO.md:L271 -->
- [ ] race-condition test  <!-- TODO.md:L272 -->
- [x] room inventory lock (advisory lock)  <!-- TODO.md:L273 -->
- [x] pending payment expiration (cron + timeout cancellation)  <!-- TODO.md:L274 -->
- [x] auto release room inventory  <!-- TODO.md:L275 -->

## P0 — Security (ความคืบหน้าบางส่วน)

- [x] audit logs ครบทุก action  <!-- TODO.md:L278 -->
- [ ] rate limit ทุก auth/payment endpoint  <!-- TODO.md:L279 -->
  - progress: `/api/payments/refund` and `/api/payments/reconcile` now have explicit rate limit guards
- [ ] brute-force protection  <!-- TODO.md:L280 -->
- [ ] session/device tracking  <!-- TODO.md:L281 -->
- [ ] IP anomaly detection  <!-- TODO.md:L282 -->
- [ ] secure upload validation  <!-- TODO.md:L283 -->
- [x] CSP/security headers  <!-- TODO.md:L284 -->
- [x] secret rotation guide  <!-- TODO.md:L285 -->
