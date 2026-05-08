# MASTER 4P TASK LIST (Consolidated)

Updated: 2026-05-08

> รวมงานทั้งหมดจากแผน 10 Phase ให้เหลือ 4P เพื่อวาง execution ได้สั้นขึ้น

## Status Legend

- ✅ Done
- ⏳ In Progress
- 📌 Planned

## 4P Status Board (Project Reality Snapshot)

- ✅ **P1** Stability/Security/Reliability baseline (core deploy gate ผ่านแล้วในรอบก่อน)
- ✅ **P2** Core auth + booking journey baseline (flow หลักใช้งานได้)
- ✅ **P3** UX/SEO/Growth baseline (batch ปัจจุบันปิดแล้ว)
- ⏳ **P4** Distribution/AI/Enterprise/Scale (ยังเป็นงานหลักคงเหลือ)

## Implementation References (Current Code Anchors)

### P1 references
- Health endpoints: `src/app/api/health/route.ts`, `src/app/api/ops/health/route.ts`
- Security/rate limiting: `src/lib/security/rate-limit.ts`
- Monitoring runbook: `docs/INCIDENT_RUNBOOK.md`, `docs/UPTIME_MONITOR.md`

### P2 references
- Auth routes/pages: `src/app/auth/*`, `src/app/portal/forgot-password/page.tsx`, `src/app/portal/reset-password/page.tsx`
- Onboarding: `src/app/onboarding/`
- Guest booking APIs: `src/app/api/guest/bookings/`

### P3 references
- SEO metadata + structured data: `src/app/destinations/[city]/page.tsx`, `src/app/h/[slug]/page.tsx`, `src/app/layout.tsx`
- Search UX: `src/app/search/page.tsx`
- Luxury UI system: `src/components/luxury/*`

### P4 references
- Channel manager: `src/app/api/ota/`, `src/lib/channel-manager/`
- AI features: `src/app/api/ai/`, `src/lib/ai/`
- Enterprise/admin: `src/app/api/admin/`, `src/app/admin/`
- Scale/ops scripts: `scripts/`, `tests/load/`

## P1 — Stability, Security, Reliability Foundation

(เดิมครอบคลุม: Phase 1 + ส่วน DevOps/Scale ที่เป็น deploy gate)

### Core Stability / Infra
- [x] Fix TypeScript strict mode ทั้งโปรเจค
- [x] ไม่มี any มั่ว
- [x] ไม่มี build warning สำคัญ
- [x] Next.js version stable
- [x] Lock package versions
- [x] Remove deprecated packages
- [x] Standardize Node version + `.nvmrc`
- [x] CI/CD pipeline จริง + Auto test ก่อน deploy
- [x] Separate dev/staging/prod env
- [x] Secret validation startup check
- [x] Environment schema validation (zod)

### Reliability
- [x] Error boundary ทุก major page
- [x] Global API error handler
- [x] Retry logic / Timeout protection / Circuit breaker
- [x] Rate limiting
- [x] Graceful fallback UI
- [x] Loading states จริงทุกจุด
- [x] Empty states
- [x] Offline handling บางส่วน

### Monitoring & Ops Visibility
- [x] Integrate Sentry
- [x] Request tracing / Session replay / API logs
- [x] Slow query detection
- [x] Cron monitoring
- [x] Uptime monitoring
- [x] Health endpoint `/api/health`
- [x] Tenant-specific error tracking

### Security
- [x] RBAC จริง
- [x] Tenant isolation audit
- [x] SQL injection audit
- [x] XSS protection / CSRF protection
- [x] Secure headers / Cookie security
- [x] Session expiration / Login rate limit / MFA support
- [x] Audit logs / Device-session management / IP anomaly detection
- [x] Backup strategy / Disaster recovery plan

---

## P2 — Auth, Onboarding, and Customer Journey

(เดิมครอบคลุม: Phase 2 + Phase 3)

### Auth & Onboarding
- [ ] Email verification fix
- [ ] Forgot password flow / Change password
- [ ] Session refresh stability
- [ ] Social login / Magic link login
- [ ] Invite staff / Organization switching
- [ ] Onboarding wizard: create hotel, room types, rooms, amenities, images
- [ ] Setup policies, taxes, payments, OTA, notifications
- [ ] Guided first booking / Progress tracking / Demo data

### Marketing / Landing
- [ ] Premium homepage
- [ ] SaaS pricing page / Feature comparison
- [ ] Testimonials / Hotel showcase
- [ ] Animated sections
- [ ] SEO optimization
- [ ] Blog system / Knowledge base / Contact sales

### Booking & Guest Experience
- [ ] Hotel profile page / Rich room cards / Room gallery
- [ ] Availability calendar / Real pricing breakdown
- [ ] Mobile booking flow / Sticky reserve button
- [ ] Coupon / Upsell / Add-on services / Package selection
- [ ] Booking confirmation / Guest dashboard / Booking management
- [ ] Cancellation flow / Invoice download
- [ ] Guest profile / Preferences / Stay history
- [ ] Loyalty / Rewards
- [ ] Reviews / Ratings / Moderation
- [ ] Multi-language UI / AI translation

---

## P3 — PMS Operations & Finance Core

(เดิมครอบคลุม: Phase 4 + Phase 5)

### Hotel Operations
- [ ] Reservations: drag-drop calendar, group booking, split, room move, waitlist
- [ ] No-show automation / Auto check-in-out / Reservation timeline
- [ ] Front desk: check-in wizard, ID-passport scan, deposit, walk-in, quick assign
- [ ] Keycard integration placeholder / TM30 workflow
- [ ] Housekeeping mobile app + real-time room status + checklist + photo + assignment + supervisor approval
- [ ] Maintenance escalation
- [ ] Maintenance tickets / preventive maintenance / equipment tracking / vendor management / SLA

### Finance & Business
- [ ] SaaS subscription / trial / usage tracking / tier limits
- [ ] Auto invoicing / failed payment retry / billing dashboard
- [ ] Folio management / split payment / refunds / tax invoices
- [ ] PromptPay / Stripe / Omise
- [ ] Revenue reports / night audit / cashier close shift

---

## P4 — Distribution, AI, Enterprise & Scale

(เดิมครอบคลุม: Phase 6 + 7 + 8 + 9 + 10)

### Channel Manager
- [ ] Booking.com / Agoda / Expedia / Airbnb sync
- [ ] Availability / Rate / Inventory sync
- [ ] Conflict handling
- [ ] OTA mapping UI
- [ ] Retry queue / Sync logs

### AI & Automation
- [ ] AI Inbox: unified inbox, reply suggestion, translation, sentiment, auto-tagging, guest intent
- [ ] AI Ops: occupancy forecast, dynamic pricing, revenue recommendation
- [ ] Auto room assignment / staff workload balancing / complaint detection

### Enterprise
- [ ] Multi-property support / cross-property reporting
- [ ] Organization hierarchy / white-label / custom branding
- [ ] API access / webhooks / SSO / advanced permissions
- [ ] Data export / GDPR tools / activity center

### DevOps & Scale + Mobile
- [ ] Queue workers / background jobs / Redis caching
- [ ] CDN optimization / image optimization
- [ ] DB indexing / query optimization
- [ ] Horizontal scaling prep / multi-region strategy
- [ ] Backup automation / restore testing
- [ ] Load testing / stress testing
- [ ] PWA / installable app / push notifications / offline caching
- [ ] Mobile housekeeping UI / mobile front desk UI
- [ ] Camera integration / QR code tools
