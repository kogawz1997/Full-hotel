# Maitri — Quick TODO

## 🔴 Sprint 1 — ทำก่อน launch

- [x] **Booking confirmation email** → แก้ `src/app/api/reservations/route.ts` เพิ่ม emailAdapter.sendMessage()
- [x] **Reset password page** → สร้าง `src/app/portal/reset-password/page.tsx`
- [x] **Wishlist page** → สร้าง `src/app/portal/wishlist/page.tsx` + `src/app/api/guest/wishlist/route.ts`
- [x] **Terms of Service** → สร้าง `src/app/terms/page.tsx`
- [x] **Privacy Policy (PDPA)** → สร้าง `src/app/privacy/page.tsx`
- [ ] **Email verification** → เปิดใน Supabase Dashboard + แก้ register flow

## 🟠 Sprint 2 — Core features

- [x] **Onboarding wizard** → สร้าง `src/app/onboarding/` (3 steps)
- [x] **Rate calendar UI** → สร้าง `src/app/dashboard/rates/page.tsx`
- [x] **Room type images** → แก้ `src/components/dashboard/rooms-client.tsx` + upload API
- [x] **Cancellation email** → แก้ `src/app/api/guest/bookings/[id]/route.ts`
- [x] **Pay at hotel** → แก้ booking-engine.tsx เพิ่ม payment method option

## 🟡 Sprint 3 — OTA-level UX

- [x] **Search page** → สร้าง `src/app/search/page.tsx` + `src/app/api/public/search/route.ts`
- [x] **Price graph** → สร้าง `src/components/booking/price-graph.tsx`
- [x] **Photo lightbox** → สร้าง `src/components/ui/lightbox.tsx`
- [x] **Urgency indicators** → แก้ booking-engine.tsx เพิ่ม "เหลือ X ห้อง"
- [x] **Guest AI chatbot** → สร้าง `src/components/booking/guest-chat-widget.tsx`

## 🟢 Sprint 4 — Scale & Legal

- [ ] **Subscription billing** → สร้าง `src/app/dashboard/billing/page.tsx` + Stripe integration
- [x] **Cookie consent banner** → สร้าง `src/components/ui/cookie-consent.tsx`
- [ ] **Data export PDPA** → สร้าง `src/app/api/guest/export/route.ts`
- [x] **Sentry** → install `@sentry/nextjs` + config files
- [ ] **Redis rate limit** → แก้ `src/lib/security/rate-limit.ts` → Upstash
- [x] **PWA manifest** → สร้าง `public/manifest.json` + icons
- [x] **OpenGraph images** → สร้าง `src/app/h/[slug]/opengraph-image.tsx`

## ⚡ Sprint 5 — Full features

- [ ] **F&B POS** → สร้าง `src/app/dashboard/fb/menu/`, `fb/orders/`
- [ ] **Spa booking** → สร้าง `src/app/dashboard/spa/services/`, `spa/bookings/`
- [ ] **Maintenance** → สร้าง `src/app/dashboard/maintenance/page.tsx`
- [x] **Multi-currency** → สร้าง `src/lib/currency.ts` + switcher
- [x] **QR check-in** → สร้าง `src/app/portal/bookings/[code]/qr/page.tsx`
- [ ] **Image optimization** → สร้าง `src/app/api/storage/optimize/route.ts` (sharp)
- [x] **DB indexes** → สร้าง `supabase/migrations/00006_performance_indexes.sql`

## ENV vars ที่ยังขาด
```
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
STRIPE_SECRET_KEY=sk_live_xxx (ถ้าทำ billing)
SENTRY_DSN=https://xxx@sentry.io/xxx (ถ้าทำ monitoring)
```

ดูรายละเอียดแต่ละข้อเพิ่มเติมใน **ROADMAP.md**

## 🎨 Sprint UX/UI — Luxury Redesign

- [x] **src/lib/images.ts** — Curated Unsplash luxury hotel images
- [x] **Luxury CSS animations** — stagger, shimmer, card-lift, glass, reveal
- [x] **useScrollReveal hook** — IntersectionObserver
- [x] **useCounter hook** — animated number counter
- [x] **AnimatedNumber component** — เลข count ขึ้นเมื่อ scroll เข้ามา
- [x] **Landing page redesign** — Full hero image, stats, pricing 3 plans, testimonials, footer ครบ
- [x] **Hotel public page** — Airbnb-style gallery grid + sticky sidebar
- [x] **Booking engine** — animated step progress, trust badges
- [x] **Search page** — Map/List toggle, infinite scroll, compare mode
- [x] **Global page transitions** — page-enter animation
- [x] **Loading skeletons** — ทุก async section


## Phase 6 — Launch Readiness Closed

- Launch dashboard `/dashboard/launch`
- Readiness API `/api/ops/readiness`
- Smoke-test API `/api/ops/smoke-test`
- Security headers and release check scripts
- See `PHASE6_CLOSED.md` and `docs/operations/P6_LAUNCH_READINESS.md`

---

## 🔴 P1 Critical — ทำก่อนรับเงิน

### Availability & Status
- [x] **Fix: booking ต้อง `pending_payment` ก่อน** → `src/app/api/reservations/route.ts` บรรทัด `status: 'confirmed'` → เปลี่ยนเป็น `pending_payment` ถ้ายังไม่ได้จ่าย
- [x] **Fix: availability เช็ค `pending_payment` ด้วย** → `src/app/api/public/availability/route.ts` เพิ่ม `pending_payment` ใน `.in('status', [...])`
- [x] **Overbooking lock** → สร้าง `src/lib/booking/availability-lock.ts` (Postgres advisory lock)
- [x] **Cancellation policy engine** → สร้าง `src/lib/booking/cancellation-policy.ts`

### Booking Flow Components
- [x] **BookingStepper** → `src/components/booking/BookingStepper.tsx`
- [x] **BookingSummary** → `src/components/booking/BookingSummary.tsx`
- [x] **GuestForm (Zod)** → `src/components/booking/GuestForm.tsx`
- [x] **PaymentMethodCard** → `src/components/booking/PaymentMethodCard.tsx`
- [x] **ConfirmationCard** → `src/components/booking/ConfirmationCard.tsx`
- [x] **Deposit flow API** → `src/app/api/payments/deposit/route.ts`

## 🟠 P1 High Priority

### Luxury Component System
- [x] `src/components/luxury/LuxuryButton.tsx`
- [x] `src/components/luxury/LuxuryCard.tsx`
- [x] `src/components/luxury/LuxurySection.tsx`
- [x] `src/components/luxury/LuxuryInput.tsx`
- [x] `src/components/luxury/LuxuryBadge.tsx`
- [x] `src/components/public/SearchHeader.tsx`
- [x] `src/components/public/HotelCard.tsx`
- [x] `src/components/public/RoomCard.tsx`
- [x] `src/components/public/FilterDrawer.tsx`
- [x] `src/components/public/LuxuryGallery.tsx`
- [x] `src/components/public/ReviewCard.tsx`
- [x] `src/components/public/StickyBookingBar.tsx`

### Search /search
- [x] Filter bottom sheet (mobile)
- [x] Sort: price/rating/popular
- [x] Loading skeleton + empty state
- [x] Active filter chips
- [x] Infinite scroll / pagination

### Hotel Detail /h/[slug]
- [x] Amenities section (icons + categories)
- [x] Policy section
- [x] Reviews (breakdown 4 มิติ)
- [x] Map embed
- [x] Nearby places
- [x] RoomCard ครบ (รูป, ขนาด, เตียง, breakfast, policy)

## 🟡 P1 Medium

### Mobile UX
- [x] Safe area support (env(safe-area-inset-*))
- [x] Swipe gallery
- [x] Bottom sheet calendar
- [x] Touch targets ≥ 44px
- [x] Collapsed summary drawer

### SEO + Trust
- [x] Hotel structured data (JSON-LD)
- [x] Breadcrumbs schema
- [x] Trust badges component
- [x] OpenGraph ครบทุกหน้า

---

## 🔴 P0 — ต้องปิดก่อน Deploy (จาก Reality Check)

### 1. npm ci / package-lock.json
- [x] **Regenerate package-lock.json** หลังเพิ่ม `@hookform/resolvers` และ `react-hook-form`
  ```bash
  rm package-lock.json
  npm install
  # commit package-lock.json ที่ได้ใหม่
  ```
- [x] **ยืนยัน clean install ผ่าน**: `rm -rf node_modules && npm ci`
- [x] **ยืนยัน build ผ่าน**: `npm run build` ต้องไม่มี error

### 2. TypeScript errors ใน reservations route
- [x] **เพิ่ม `paymentMethod` และ `ratePlanType` ใน `createReservationSchema`**
  ```typescript
  // src/app/api/reservations/route.ts
  paymentMethod: z.enum(['online','at_hotel','deposit']).default('online'),
  ratePlanType:  z.string().max(50).optional().nullable(),
  ```
- [x] รัน `npm run type-check` ให้ผ่าน 0 errors ก่อน deploy

### 3. Payment "fail closed" ใน Production
- [x] **แก้ refund, deposit, reconcile routes** — ถ้าไม่มี `OMISE_SECRET_KEY` ใน production ต้อง **return error** ไม่ใช่ return mock success
  ```typescript
  // ผิด (ตอนนี้):
  if (process.env.OMISE_SECRET_KEY && !includes('demo')) { /* real */ }
  // ไม่มี key → ยังทำงานต่อกับ mock result

  // ถูก:
  if (!process.env.OMISE_SECRET_KEY || process.env.NODE_ENV === 'production') {
    if (!process.env.OMISE_SECRET_KEY) {
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 })
    }
  }
  ```
- [x] เพิ่ม guard ใน `src/app/api/payments/refund/route.ts`
- [x] เพิ่ม guard ใน `src/app/api/payments/deposit/route.ts`
- [x] เพิ่ม guard ใน `src/app/api/payments/charge/route.ts`

### 4. OTA sync — ระบุชัดว่า placeholder
- [x] **ซ่อน OTA channels ที่ยังไม่พร้อม** ออกจาก UI ลูกค้า
  ```typescript
  // src/app/dashboard/channels/page.tsx
  // แสดง "Coming Soon" badge สำหรับ Booking.com, Agoda, Airbnb
  // ที่ยังไม่มี certified integration
  ```
- [x] **เพิ่ม disclaimer** ใน channel settings: "การเชื่อมต่อ OTA ต้องการ API credentials จาก vendor โดยตรง"
- [x] **OTA sync cron** — เพิ่ม early return ถ้าไม่มี `channel.api_key` พร้อม log ที่ชัดเจน
- [x] แยกให้ชัดใน docs ว่า OTA ไหน "พร้อมใช้" vs "รอ vendor approval"

---

## 🟠 ขาดฝั่งลูกค้า — ทำเร็ว (1-2 วัน)

### Payment States (Critical)
- [x] `src/app/booking/[slug]/success/page.tsx` — หน้า payment สำเร็จ + booking code
- [x] `src/app/booking/[slug]/pending/page.tsx` — รอชำระ PromptPay/transfer
- [x] `src/app/booking/[slug]/failed/page.tsx` — ชำระไม่สำเร็จ + retry

### Guest Portal
- [x] Cancel booking button + confirmation modal ใน `src/app/portal/bookings/page.tsx`
- [x] Download receipt PDF link ใน portal
- [x] Forgot password page `src/app/portal/forgot-password/page.tsx`
- [x] Write review after checkout (rating + comment form)

### Hotel Detail (/h/[slug])
- [x] Policies section — check-in time, check-out time, cancellation, child policy, pet policy
- [x] Nearby places — 3-4 สถานที่ (static หรือ Google Places API)
- [x] Map embed — Google Maps iframe หรือ OpenStreetMap
- [x] JSON-LD Hotel schema สำหรับ SEO

### Landing Page
- [x] Destination cards section — Bangkok, Chiang Mai, Phuket, Samui (ดึงจาก DB หรือ static)
- [x] Featured hotels section — top rated จาก DB
- [x] "ทำไมต้องจองกับเรา" section — trust signals

### Components
- [x] `src/components/public/HotelCard.tsx` — ย้าย HotelCard ออกจาก search/page.tsx
- [x] `src/components/public/TrustBadges.tsx` — SSL, Secure Payment, Verified Hotel
- [x] PromptPay QR ใน payment flow

### SEO
- [x] `src/app/sitemap.ts`
- [x] `src/app/robots.ts`
- [x] Canonical URLs ใน hotel pages

---

## 🔴 ขาดฝั่งลูกค้า — ทำหนัก (3-7 วัน)

- [ ] Swipe gallery บน mobile (touch/pointer events)
- [x] Recently viewed hotels (localStorage + sync)
- [ ] AI-based recommended hotels
- [ ] Compare hotels feature (2-3 โรงแรม side-by-side)
- [x] Last-minute deals section
- [ ] Pre-stay direct message to hotel
