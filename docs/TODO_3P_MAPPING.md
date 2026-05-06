# TODO → 3P One-to-One Mapping

อัปเดต: 2026-05-06

รายการนี้ map งาน `[ ]` ทุกข้อจาก `TODO.md` เข้ากับ P1/P2/P3 แบบ 1:1

## P1 — Deploy Gate (13 งาน)

- [ ] **Regenerate package-lock.json** หลังเพิ่ม `@hookform/resolvers` และ `react-hook-form`  <!-- TODO.md:L151 -->
- [ ] **ยืนยัน clean install ผ่าน**: `rm -rf node_modules && npm ci`  <!-- TODO.md:L157 -->
- [ ] **ยืนยัน build ผ่าน**: `npm run build` ต้องไม่มี error  <!-- TODO.md:L158 -->
- [ ] **เพิ่ม `paymentMethod` และ `ratePlanType` ใน `createReservationSchema`**  <!-- TODO.md:L161 -->
- [ ] รัน `npm run type-check` ให้ผ่าน 0 errors ก่อน deploy  <!-- TODO.md:L167 -->
- [ ] **แก้ refund, deposit, reconcile routes** — ถ้าไม่มี `OMISE_SECRET_KEY` ใน production ต้อง **return error** ไม่ใช่ return mock success  <!-- TODO.md:L170 -->
- [ ] เพิ่ม guard ใน `src/app/api/payments/refund/route.ts`  <!-- TODO.md:L183 -->
- [ ] เพิ่ม guard ใน `src/app/api/payments/deposit/route.ts`  <!-- TODO.md:L184 -->
- [ ] เพิ่ม guard ใน `src/app/api/payments/charge/route.ts`  <!-- TODO.md:L185 -->
- [ ] **ซ่อน OTA channels ที่ยังไม่พร้อม** ออกจาก UI ลูกค้า  <!-- TODO.md:L188 -->
- [ ] **เพิ่ม disclaimer** ใน channel settings: "การเชื่อมต่อ OTA ต้องการ API credentials จาก vendor โดยตรง"  <!-- TODO.md:L194 -->
- [ ] **OTA sync cron** — เพิ่ม early return ถ้าไม่มี `channel.api_key` พร้อม log ที่ชัดเจน  <!-- TODO.md:L195 -->
- [ ] แยกให้ชัดใน docs ว่า OTA ไหน "พร้อมใช้" vs "รอ vendor approval"  <!-- TODO.md:L196 -->

## P2 — Core Guest & Booking (3 งาน)

- [ ] **Room type images** → แก้ `src/components/dashboard/rooms-client.tsx` + upload API  <!-- TODO.md:L16 -->
- [ ] **Pay at hotel** → แก้ booking-engine.tsx เพิ่ม payment method option  <!-- TODO.md:L18 -->
- [ ] **QR check-in** → สร้าง `src/app/portal/bookings/[code]/qr/page.tsx`  <!-- TODO.md:L44 -->

## P3 — Scale / SEO / Growth (31 งาน)

- [ ] **Email verification** → เปิดใน Supabase Dashboard + แก้ register flow  <!-- TODO.md:L10 -->
- [ ] **Subscription billing** → สร้าง `src/app/dashboard/billing/page.tsx` + Stripe integration  <!-- TODO.md:L30 -->
- [ ] **Data export PDPA** → สร้าง `src/app/api/guest/export/route.ts`  <!-- TODO.md:L32 -->
- [ ] **Redis rate limit** → แก้ `src/lib/security/rate-limit.ts` → Upstash  <!-- TODO.md:L34 -->
- [ ] **PWA manifest** → สร้าง `public/manifest.json` + icons  <!-- TODO.md:L35 -->
- [ ] **OpenGraph images** → สร้าง `src/app/h/[slug]/opengraph-image.tsx`  <!-- TODO.md:L36 -->
- [ ] **F&B POS** → สร้าง `src/app/dashboard/fb/menu/`, `fb/orders/`  <!-- TODO.md:L40 -->
- [ ] **Spa booking** → สร้าง `src/app/dashboard/spa/services/`, `spa/bookings/`  <!-- TODO.md:L41 -->
- [ ] **Maintenance** → สร้าง `src/app/dashboard/maintenance/page.tsx`  <!-- TODO.md:L42 -->
- [ ] **Image optimization** → สร้าง `src/app/api/storage/optimize/route.ts` (sharp)  <!-- TODO.md:L45 -->
- [ ] **Hotel public page** — Airbnb-style gallery grid + sticky sidebar  <!-- TODO.md:L67 -->
- [ ] **Booking engine** — animated step progress, trust badges  <!-- TODO.md:L68 -->
- [ ] **Search page** — Map/List toggle, infinite scroll, compare mode  <!-- TODO.md:L69 -->
- [ ] **Global page transitions** — page-enter animation  <!-- TODO.md:L70 -->
- [ ] **Loading skeletons** — ทุก async section  <!-- TODO.md:L71 -->
- [ ] Policies section — check-in time, check-out time, cancellation, child policy, pet policy  <!-- TODO.md:L214 -->
- [ ] Nearby places — 3-4 สถานที่ (static หรือ Google Places API)  <!-- TODO.md:L215 -->
- [ ] Map embed — Google Maps iframe หรือ OpenStreetMap  <!-- TODO.md:L216 -->
- [ ] JSON-LD Hotel schema สำหรับ SEO  <!-- TODO.md:L217 -->
- [ ] Destination cards section — Bangkok, Chiang Mai, Phuket, Samui (ดึงจาก DB หรือ static)  <!-- TODO.md:L220 -->
- [ ] Featured hotels section — top rated จาก DB  <!-- TODO.md:L221 -->
- [ ] "ทำไมต้องจองกับเรา" section — trust signals  <!-- TODO.md:L222 -->
- [ ] `src/components/public/HotelCard.tsx` — ย้าย HotelCard ออกจาก search/page.tsx  <!-- TODO.md:L225 -->
- [ ] PromptPay QR ใน payment flow  <!-- TODO.md:L227 -->
- [ ] Canonical URLs ใน hotel pages  <!-- TODO.md:L232 -->
- [ ] Swipe gallery บน mobile (touch/pointer events)  <!-- TODO.md:L238 -->
- [ ] Recently viewed hotels (localStorage + sync)  <!-- TODO.md:L239 -->
- [ ] AI-based recommended hotels  <!-- TODO.md:L240 -->
- [ ] Compare hotels feature (2-3 โรงแรม side-by-side)  <!-- TODO.md:L241 -->
- [ ] Last-minute deals section  <!-- TODO.md:L242 -->
- [ ] Pre-stay direct message to hotel  <!-- TODO.md:L243 -->
