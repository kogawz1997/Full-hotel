# All Work Split into 3P

อัปเดต: 2026-05-07

เอกสารนี้รวมงานทั้งหมดจาก TODO (ทั้งที่เสร็จและยังไม่เสร็จ) แล้วแบ่งเป็น 3P

## P1 (13 งาน | เสร็จแล้ว 13 | คงเหลือ 0)

- [x] **Regenerate package-lock.json** หลังเพิ่ม `@hookform/resolvers` และ `react-hook-form`  <!-- TODO.md:L151 -->
- [x] **ยืนยัน clean install ผ่าน**: `rm -rf node_modules && npm ci`  <!-- TODO.md:L157 -->
- [x] **ยืนยัน build ผ่าน**: `npm run build` ต้องไม่มี error  <!-- TODO.md:L158 -->
- [x] **เพิ่ม `paymentMethod` และ `ratePlanType` ใน `createReservationSchema`**  <!-- TODO.md:L161 -->
- [x] รัน `npm run type-check` ให้ผ่าน 0 errors ก่อน deploy  <!-- TODO.md:L167 -->
- [x] **แก้ refund, deposit, reconcile routes** — ถ้าไม่มี `OMISE_SECRET_KEY` ใน production ต้อง **return error** ไม่ใช่ return mock success  <!-- TODO.md:L170 -->
- [x] เพิ่ม guard ใน `src/app/api/payments/refund/route.ts`  <!-- TODO.md:L183 -->
- [x] เพิ่ม guard ใน `src/app/api/payments/deposit/route.ts`  <!-- TODO.md:L184 -->
- [x] เพิ่ม guard ใน `src/app/api/payments/charge/route.ts`  <!-- TODO.md:L185 -->
- [x] **ซ่อน OTA channels ที่ยังไม่พร้อม** ออกจาก UI ลูกค้า  <!-- TODO.md:L188 -->
- [x] **เพิ่ม disclaimer** ใน channel settings: "การเชื่อมต่อ OTA ต้องการ API credentials จาก vendor โดยตรง"  <!-- TODO.md:L194 -->
- [x] **OTA sync cron** — เพิ่ม early return ถ้าไม่มี `channel.api_key` พร้อม log ที่ชัดเจน  <!-- TODO.md:L195 -->
- [x] แยกให้ชัดใน docs ว่า OTA ไหน "พร้อมใช้" vs "รอ vendor approval"  <!-- TODO.md:L196 -->

## P2 (32 งาน | เสร็จแล้ว 31 | คงเหลือ 1)

- [x] **Booking confirmation email** → แก้ `src/app/api/reservations/route.ts` เพิ่ม emailAdapter.sendMessage()  <!-- TODO.md:L5 -->
- [x] **Reset password page** → สร้าง `src/app/portal/reset-password/page.tsx`  <!-- TODO.md:L6 -->
- [x] **Wishlist page** → สร้าง `src/app/portal/wishlist/page.tsx` + `src/app/api/guest/wishlist/route.ts`  <!-- TODO.md:L7 -->
- [x] **Cancellation email** → แก้ `src/app/api/guest/bookings/[id]/route.ts`  <!-- TODO.md:L17 -->
- [x] **Pay at hotel** → แก้ booking-engine.tsx เพิ่ม payment method option  <!-- TODO.md:L18 -->
- [x] **Search page** → สร้าง `src/app/search/page.tsx` + `src/app/api/public/search/route.ts`  <!-- TODO.md:L22 -->
- [x] **Price graph** → สร้าง `src/components/booking/price-graph.tsx`  <!-- TODO.md:L23 -->
- [x] **Urgency indicators** → แก้ booking-engine.tsx เพิ่ม "เหลือ X ห้อง"  <!-- TODO.md:L25 -->
- [x] **Guest AI chatbot** → สร้าง `src/components/booking/guest-chat-widget.tsx`  <!-- TODO.md:L26 -->
- [ ] **Spa booking** → สร้าง `src/app/dashboard/spa/services/`, `spa/bookings/`  <!-- TODO.md:L41 -->
- [x] **QR check-in** → สร้าง `src/app/portal/bookings/[code]/qr/page.tsx`  <!-- TODO.md:L44 -->
- [x] **Hotel public page** — Airbnb-style gallery grid + sticky sidebar  <!-- TODO.md:L67 -->
- [x] **Booking engine** — animated step progress, trust badges  <!-- TODO.md:L68 -->
- [x] **Search page** — Map/List toggle, infinite scroll, compare mode  <!-- TODO.md:L69 -->
- [x] **Global page transitions** — page-enter animation  <!-- TODO.md:L70 -->
- [x] **Loading skeletons** — ทุก async section  <!-- TODO.md:L71 -->
- [x] **Fix: booking ต้อง `pending_payment` ก่อน** → `src/app/api/reservations/route.ts` บรรทัด `status: 'confirmed'` → เปลี่ยนเป็น `pending_payment` ถ้ายังไม่ได้จ่าย  <!-- TODO.md:L87 -->
- [x] **Overbooking lock** → สร้าง `src/lib/booking/availability-lock.ts` (Postgres advisory lock)  <!-- TODO.md:L89 -->
- [x] **Cancellation policy engine** → สร้าง `src/lib/booking/cancellation-policy.ts`  <!-- TODO.md:L90 -->
- [x] **BookingStepper** → `src/components/booking/BookingStepper.tsx`  <!-- TODO.md:L93 -->
- [x] **BookingSummary** → `src/components/booking/BookingSummary.tsx`  <!-- TODO.md:L94 -->
- [x] **GuestForm (Zod)** → `src/components/booking/GuestForm.tsx`  <!-- TODO.md:L95 -->
- [x] **PaymentMethodCard** → `src/components/booking/PaymentMethodCard.tsx`  <!-- TODO.md:L96 -->
- [x] **ConfirmationCard** → `src/components/booking/ConfirmationCard.tsx`  <!-- TODO.md:L97 -->
- [x] `src/components/public/StickyBookingBar.tsx`  <!-- TODO.md:L114 -->
- [x] `src/app/booking/[slug]/success/page.tsx` — หน้า payment สำเร็จ + booking code  <!-- TODO.md:L203 -->
- [x] `src/app/booking/[slug]/pending/page.tsx` — รอชำระ PromptPay/transfer  <!-- TODO.md:L204 -->
- [x] `src/app/booking/[slug]/failed/page.tsx` — ชำระไม่สำเร็จ + retry  <!-- TODO.md:L205 -->
- [x] Cancel booking button + confirmation modal ใน `src/app/portal/bookings/page.tsx`  <!-- TODO.md:L208 -->
- [x] Download receipt PDF link ใน portal  <!-- TODO.md:L209 -->
- [x] Forgot password page `src/app/portal/forgot-password/page.tsx`  <!-- TODO.md:L210 -->
- [x] PromptPay QR ใน payment flow  <!-- TODO.md:L227 -->

## P3 (77 งาน | เสร็จแล้ว 59 | คงเหลือ 18)

- [x] **Terms of Service** → สร้าง `src/app/terms/page.tsx`  <!-- TODO.md:L8 -->
- [x] **Privacy Policy (PDPA)** → สร้าง `src/app/privacy/page.tsx`  <!-- TODO.md:L9 -->
- [ ] **Email verification** → เปิดใน Supabase Dashboard + แก้ register flow  <!-- TODO.md:L10 -->
- [x] **Onboarding wizard** → สร้าง `src/app/onboarding/` (3 steps)  <!-- TODO.md:L14 -->
- [x] **Rate calendar UI** → สร้าง `src/app/dashboard/rates/page.tsx`  <!-- TODO.md:L15 -->
- [x] **Room type images** → แก้ `src/components/dashboard/rooms-client.tsx` + upload API  <!-- TODO.md:L16 -->
- [x] **Photo lightbox** → สร้าง `src/components/ui/lightbox.tsx`  <!-- TODO.md:L24 -->
- [ ] **Subscription billing** → สร้าง `src/app/dashboard/billing/page.tsx` + Stripe integration  <!-- TODO.md:L30 -->
- [x] **Cookie consent banner** → สร้าง `src/components/ui/cookie-consent.tsx`  <!-- TODO.md:L31 -->
- [ ] **Data export PDPA** → สร้าง `src/app/api/guest/export/route.ts`  <!-- TODO.md:L32 -->
- [x] **Sentry** → install `@sentry/nextjs` + config files  <!-- TODO.md:L33 -->
- [ ] **Redis rate limit** → แก้ `src/lib/security/rate-limit.ts` → Upstash  <!-- TODO.md:L34 -->
- [ ] **PWA manifest** → สร้าง `public/manifest.json` + icons  <!-- TODO.md:L35 -->
- [x] **OpenGraph images** → สร้าง `src/app/h/[slug]/opengraph-image.tsx`  <!-- TODO.md:L36 -->
- [ ] **F&B POS** → สร้าง `src/app/dashboard/fb/menu/`, `fb/orders/`  <!-- TODO.md:L40 -->
- [ ] **Maintenance** → สร้าง `src/app/dashboard/maintenance/page.tsx`  <!-- TODO.md:L42 -->
- [x] **Multi-currency** → สร้าง `src/lib/currency.ts` + switcher  <!-- TODO.md:L43 -->
- [ ] **Image optimization** → สร้าง `src/app/api/storage/optimize/route.ts` (sharp)  <!-- TODO.md:L45 -->
- [x] **DB indexes** → สร้าง `supabase/migrations/00006_performance_indexes.sql`  <!-- TODO.md:L46 -->
- [x] **src/lib/images.ts** — Curated Unsplash luxury hotel images  <!-- TODO.md:L61 -->
- [x] **Luxury CSS animations** — stagger, shimmer, card-lift, glass, reveal  <!-- TODO.md:L62 -->
- [x] **useScrollReveal hook** — IntersectionObserver  <!-- TODO.md:L63 -->
- [x] **useCounter hook** — animated number counter  <!-- TODO.md:L64 -->
- [x] **AnimatedNumber component** — เลข count ขึ้นเมื่อ scroll เข้ามา  <!-- TODO.md:L65 -->
- [x] **Landing page redesign** — Full hero image, stats, pricing 3 plans, testimonials, footer ครบ  <!-- TODO.md:L66 -->
- [x] **Fix: availability เช็ค `pending_payment` ด้วย** → `src/app/api/public/availability/route.ts` เพิ่ม `pending_payment` ใน `.in('status', [...])`  <!-- TODO.md:L88 -->
- [x] **Deposit flow API** → `src/app/api/payments/deposit/route.ts`  <!-- TODO.md:L98 -->
- [x] `src/components/luxury/LuxuryButton.tsx`  <!-- TODO.md:L103 -->
- [x] `src/components/luxury/LuxuryCard.tsx`  <!-- TODO.md:L104 -->
- [x] `src/components/luxury/LuxurySection.tsx`  <!-- TODO.md:L105 -->
- [x] `src/components/luxury/LuxuryInput.tsx`  <!-- TODO.md:L106 -->
- [x] `src/components/luxury/LuxuryBadge.tsx`  <!-- TODO.md:L107 -->
- [x] `src/components/public/SearchHeader.tsx`  <!-- TODO.md:L108 -->
- [x] `src/components/public/HotelCard.tsx`  <!-- TODO.md:L109 -->
- [x] `src/components/public/RoomCard.tsx`  <!-- TODO.md:L110 -->
- [x] `src/components/public/FilterDrawer.tsx`  <!-- TODO.md:L111 -->
- [x] `src/components/public/LuxuryGallery.tsx`  <!-- TODO.md:L112 -->
- [x] `src/components/public/ReviewCard.tsx`  <!-- TODO.md:L113 -->
- [x] Filter bottom sheet (mobile)  <!-- TODO.md:L117 -->
- [x] Sort: price/rating/popular  <!-- TODO.md:L118 -->
- [x] Loading skeleton + empty state  <!-- TODO.md:L119 -->
- [x] Active filter chips  <!-- TODO.md:L120 -->
- [x] Infinite scroll / pagination  <!-- TODO.md:L121 -->
- [x] Amenities section (icons + categories)  <!-- TODO.md:L124 -->
- [x] Policy section  <!-- TODO.md:L125 -->
- [x] Reviews (breakdown 4 มิติ)  <!-- TODO.md:L126 -->
- [x] Map embed  <!-- TODO.md:L127 -->
- [x] Nearby places  <!-- TODO.md:L128 -->
- [x] RoomCard ครบ (รูป, ขนาด, เตียง, breakfast, policy)  <!-- TODO.md:L129 -->
- [x] Safe area support (env(safe-area-inset-*))  <!-- TODO.md:L134 -->
- [x] Swipe gallery  <!-- TODO.md:L135 -->
- [x] Bottom sheet calendar  <!-- TODO.md:L136 -->
- [x] Touch targets ≥ 44px  <!-- TODO.md:L137 -->
- [x] Collapsed summary drawer  <!-- TODO.md:L138 -->
- [x] Hotel structured data (JSON-LD)  <!-- TODO.md:L141 -->
- [x] Breadcrumbs schema  <!-- TODO.md:L142 -->
- [x] Trust badges component  <!-- TODO.md:L143 -->
- [x] OpenGraph ครบทุกหน้า  <!-- TODO.md:L144 -->
- [x] Write review after checkout (rating + comment form)  <!-- TODO.md:L211 -->
- [x] Policies section — check-in time, check-out time, cancellation, child policy, pet policy  <!-- TODO.md:L214 -->
- [x] Nearby places — 3-4 สถานที่ (static หรือ Google Places API)  <!-- TODO.md:L215 -->
- [x] Map embed — Google Maps iframe หรือ OpenStreetMap  <!-- TODO.md:L216 -->
- [x] JSON-LD Hotel schema สำหรับ SEO  <!-- TODO.md:L217 -->
- [ ] Destination cards section — Bangkok, Chiang Mai, Phuket, Samui (ดึงจาก DB หรือ static)  <!-- TODO.md:L220 -->
- [ ] Featured hotels section — top rated จาก DB  <!-- TODO.md:L221 -->
- [ ] "ทำไมต้องจองกับเรา" section — trust signals  <!-- TODO.md:L222 -->
- [ ] `src/components/public/HotelCard.tsx` — ย้าย HotelCard ออกจาก search/page.tsx  <!-- TODO.md:L225 -->
- [x] `src/components/public/TrustBadges.tsx` — SSL, Secure Payment, Verified Hotel  <!-- TODO.md:L226 -->
- [x] `src/app/sitemap.ts`  <!-- TODO.md:L230 -->
- [x] `src/app/robots.ts`  <!-- TODO.md:L231 -->
- [x] Canonical URLs ใน hotel pages  <!-- TODO.md:L232 -->
- [ ] Swipe gallery บน mobile (touch/pointer events)  <!-- TODO.md:L238 -->
- [ ] Recently viewed hotels (localStorage + sync)  <!-- TODO.md:L239 -->
- [ ] AI-based recommended hotels  <!-- TODO.md:L240 -->
- [ ] Compare hotels feature (2-3 โรงแรม side-by-side)  <!-- TODO.md:L241 -->
- [ ] Last-minute deals section  <!-- TODO.md:L242 -->
- [ ] Pre-stay direct message to hotel  <!-- TODO.md:L243 -->
