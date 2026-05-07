# Launch Gap Closure Plan (P0 → P4)

วันที่อัปเดต: 2026-05-07
เจ้าของเอกสาร (Credit): **KOGA.EXE**

## P0 — ต้องปิดก่อนเปิดรับลูกค้า

### 1) Build / TypeScript / CI
- [x] Node version alignment: `package.json` (20.x), Docker (node:20), CI (20)
- [x] CI รัน `npm ci`, `npm run type-check`, `npm run build`
- [x] เพิ่ม script รวม: `npm run check:p0`
- [ ] บังคับ branch protection ให้ require CI checks (ตั้งค่าบน GitHub repository settings)

### 2) Payment Hardening
- [x] webhook verification (Omise signature + tokenized webhooks where applicable)
- [x] duplicate payment protection / reconcile job มี route แล้ว
- [x] refund flow มีแล้ว
- [ ] partial refund test case อัตโนมัติ
- [ ] chargeback status handling matrix
- [ ] payment timeout + retry integration test

### 3) Reservation Safety
- [x] availability lock / overbooking lock implementation
- [x] pending payment expiration cron route exists
- [ ] race-condition test แบบ concurrent จริง
- [ ] auto-release inventory ทดสอบแบบ end-to-end

### 4) Security
- [x] security headers + webhook security + upload endpoints มี validation layer
- [x] rate limit หลักมีแล้ว
- [ ] brute-force threshold tuning + lockout policy doc
- [ ] session/device tracking
- [ ] IP anomaly detection
- [ ] secret rotation runbook (owner-facing)

---

## P1 — ระบบตลาดจริงต้องมี
- OTA real sync workers + retry queue + reconciliation: **partial (UI/API ready, vendor credentials/worker hardening pending)**
- Pricing engine advanced rules: **partial**
- Accounting edge-cases / multi-payment folios: **partial**
- Guest experience (self check-in, upsell, add-ons): **partial**

## P2 — Polish
- Mobile/A11y/empty-state completeness: **in progress**
- Search intelligence + personalization: **in progress**
- SEO/marketing automation: **in progress**

## P3 — Enterprise/Scale
- Reliability engineering (DLQ/failover/observability): **in progress**
- Multi-property centralized operations: **in progress**
- AI layer forecasting/prediction: **in progress**

## P4 — Ecosystem
- Public API / plugin / marketplace / external developer docs: **planned**
- Mobile apps (housekeeping/owner/guest): **planned**

---

## Immediate execution order (next 7 days)
1. Enforce CI required checks on `main`.
2. Add automated tests for payment timeout, duplicate charge, partial refund.
3. Add concurrent reservation race test (parallel booking attempts same inventory).
4. Publish security secret-rotation runbook.
5. Run full smoke suite post-deploy (`/`, `/auth/signup`, `/dashboard`, `/search`, `/h/[slug]`, `/booking/[slug]`).
