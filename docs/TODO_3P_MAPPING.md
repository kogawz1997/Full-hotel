# TODO → 3P One-to-One Mapping

อัปเดต: 2026-05-07

งานคงค้างทั้งหมด: 19 งาน

## P2 — Core Booking & UX (0 งาน)

- [ ] **ซ่อน OTA channels ที่ยังไม่พร้อม** ออกจาก UI ลูกค้า  <!-- TODO.md:L188 -->
- [ ] **เพิ่ม disclaimer** ใน channel settings: "การเชื่อมต่อ OTA ต้องการ API credentials จาก vendor โดยตรง"  <!-- TODO.md:L194 -->
- [ ] **OTA sync cron** — เพิ่ม early return ถ้าไม่มี `channel.api_key` พร้อม log ที่ชัดเจน  <!-- TODO.md:L195 -->
- [ ] แยกให้ชัดใน docs ว่า OTA ไหน "พร้อมใช้" vs "รอ vendor approval"  <!-- TODO.md:L196 -->

## P2 — Core Booking & UX (9 งาน)

- [ ] **Room type images** → แก้ `src/components/dashboard/rooms-client.tsx` + upload API  <!-- TODO.md:L16 -->
- [ ] **Pay at hotel** → แก้ booking-engine.tsx เพิ่ม payment method option  <!-- TODO.md:L18 -->
- [ ] **QR check-in** → สร้าง `src/app/portal/bookings/[code]/qr/page.tsx`  <!-- TODO.md:L44 -->
- [ ] **Hotel public page** — Airbnb-style gallery grid + sticky sidebar  <!-- TODO.md:L67 -->
- [ ] **Booking engine** — animated step progress, trust badges  <!-- TODO.md:L68 -->
- [ ] **Search page** — Map/List toggle, infinite scroll, compare mode  <!-- TODO.md:L69 -->
- [ ] **Global page transitions** — page-enter animation  <!-- TODO.md:L70 -->
- [ ] **Loading skeletons** — ทุก async section  <!-- TODO.md:L71 -->
- [ ] PromptPay QR ใน payment flow  <!-- TODO.md:L227 -->

## P3 — Scale/SEO/Growth (20 งาน)

- [ ] **Email verification** → เปิดใน Supabase Dashboard + แก้ register flow  <!-- TODO.md:L10 -->
- [ ] **Subscription billing** → สร้าง `src/app/dashboard/billing/page.tsx` + Stripe integration  <!-- TODO.md:L30 -->
- [ ] **Data export PDPA** → สร้าง `src/app/api/guest/export/route.ts`  <!-- TODO.md:L32 -->
- [ ] **Redis rate limit** → แก้ `src/lib/security/rate-limit.ts` → Upstash  <!-- TODO.md:L34 -->
- [ ] **PWA manifest** → สร้าง `public/manifest.webmanifest` + icons  <!-- TODO.md:L35 -->
- [ ] **OpenGraph images** → สร้าง `src/app/h/[slug]/opengraph-image.tsx`  <!-- TODO.md:L36 -->
- [ ] **F&B POS** → สร้าง `src/app/dashboard/fb/menu/`, `fb/orders/`  <!-- TODO.md:L40 -->
- [ ] **Spa booking** → สร้าง `src/app/dashboard/spa/services/`, `spa/bookings/`  <!-- TODO.md:L41 -->
- [ ] **Maintenance** → สร้าง `src/app/dashboard/maintenance/page.tsx`  <!-- TODO.md:L42 -->
- [ ] **Image optimization** → สร้าง `src/app/api/storage/optimize/route.ts` (sharp)  <!-- TODO.md:L45 -->
- [ ] Destination cards section — Bangkok, Chiang Mai, Phuket, Samui (ดึงจาก DB หรือ static)  <!-- TODO.md:L220 -->
- [ ] Featured hotels section — top rated จาก DB  <!-- TODO.md:L221 -->
- [ ] "ทำไมต้องจองกับเรา" section — trust signals  <!-- TODO.md:L222 -->
- [ ] `src/components/public/HotelCard.tsx` — ย้าย HotelCard ออกจาก search/page.tsx  <!-- TODO.md:L225 -->
- [ ] Swipe gallery บน mobile (touch/pointer events)  <!-- TODO.md:L238 -->
- [ ] Recently viewed hotels (localStorage + sync)  <!-- TODO.md:L239 -->
- [ ] AI-based recommended hotels  <!-- TODO.md:L240 -->
- [ ] Compare hotels feature (2-3 โรงแรม side-by-side)  <!-- TODO.md:L241 -->
- [ ] Last-minute deals section  <!-- TODO.md:L242 -->
- [ ] Pre-stay direct message to hotel  <!-- TODO.md:L243 -->
