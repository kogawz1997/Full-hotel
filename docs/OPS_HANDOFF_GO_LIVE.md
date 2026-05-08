# OPS Handoff — Go-Live Tasks That Require Production Access

อัปเดต: 2026-05-08 (UTC)

เอกสารนี้สรุปงานที่ Dev ทำใน repo ให้ไม่ได้โดยตรง และเตรียม “หน้างาน” ให้ทีม Ops/Owner ไปทำต่อได้ทันที

---

## 1) งานที่ยังทำไม่ได้จากฝั่งโค้ด (Blocked by Environment Access)

| งาน | ทำไม่ได้เพราะอะไร | คนที่ควรทำ | หลักฐานที่ต้องแนบ |
|---|---|---|---|
| ตั้งค่า `SENDGRID_FROM_EMAIL` | ต้องเป็น verified sender/domain ใน SendGrid production | Ops / Email owner | screenshot sender verified + env set สำเร็จ |
| ตั้งค่า `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | ต้องสร้าง Redis DB จริงใน Upstash account | Ops | screenshot DB + ค่า env ถูก inject |
| ตั้งค่า `STRIPE_SECRET_KEY` | ต้องใช้ live key จาก Stripe account จริง | Finance/Ops | screenshot restricted live key + deploy env updated |
| ตั้งค่า `SENTRY_DSN` | ต้องมี project จริงใน Sentry org | Ops / SRE | screenshot project DSN + event test ผ่าน |
| ตรวจ Email verification ใน Supabase production | ต้องมีสิทธิ์ Dashboard ของ production project | Owner/Ops | screenshot auth settings + test account verified flow |

### Owner + Due date (สำหรับปิดงานค้างรอบถัดไป)

| Workstream | Primary Owner | Backup Owner | Ticket/Issue | Target Due Date (UTC) | Status |
|---|---|---|---|---|---|
| SendGrid sender/domain verification | Ops | Owner | OPS-GL-001 | 2026-05-10 | Waiting execution |
| Upstash Redis provisioning + env inject | Ops | SRE | OPS-GL-002 | 2026-05-10 | Waiting execution |
| Stripe live secret/key rotation | Finance/Ops | Owner | OPS-GL-003 | 2026-05-11 | Waiting execution |
| Sentry project + DSN wiring | SRE/Ops | Ops | OPS-GL-004 | 2026-05-11 | Waiting execution |
| Supabase email verification validation | Owner/Ops | Dev | OPS-GL-005 | 2026-05-11 | Waiting execution |

---

## 2) หน้างานที่เตรียมไว้ให้ทำต่อทันที

### 2.1 Deployment evidence template (copy/paste)

```md
## Go-live Sign-off
- Date/Time (UTC):
- Environment: production
- Owner:
- Reviewer:

### Env Verification
- [ ] SENDGRID_FROM_EMAIL
- [ ] UPSTASH_REDIS_REST_URL
- [ ] UPSTASH_REDIS_REST_TOKEN
- [ ] STRIPE_SECRET_KEY (if billing enabled)
- [ ] SENTRY_DSN (if monitoring enabled)

### Runtime Checks
- [ ] npm run check:env (pass)
- [ ] /api/ops/smoke-test (pass)
- [ ] /api/ops/readiness (all green)

### Evidence Links
- Dashboard screenshots:
- Smoke/readiness logs:
- Rollback plan location:
```

### 2.2 คำสั่งที่ทีม Ops ใช้ได้ทันทีหลังเติม env

```bash
export BASE_URL=https://yourdomain.com
# optional for protected endpoints
# export AUTH_HEADER=x-ops-token
# export AUTH_TOKEN=replace-with-token
npm run check:env
npm run smoke
npm run go-live:evidence
curl -i "$BASE_URL/api/ops/readiness"
```

### 2.3 เกณฑ์ปิดงานค้างทีละข้อ

- `SENDGRID_FROM_EMAIL`: ปิดได้เมื่อส่ง mail จาก production domain ได้จริงอย่างน้อย 1 เคส
- `UPSTASH_*`: ปิดได้เมื่อ rate-limit path ทำงานและไม่ throw config error
- `STRIPE_SECRET_KEY`: ปิดได้เมื่อ charge/deposit ในโหมด production ไม่ใช้ mock fallback
- `SENTRY_DSN`: ปิดได้เมื่อเห็น test event ใน Sentry project
- Supabase email verification: ปิดได้เมื่อสมัครผู้ใช้ใหม่แล้วสถานะ verify ตาม policy จริง

### 2.4 Rollback plan (short)

- ถ้า smoke/readiness fail หลังเปลี่ยน env: rollback โดย revert ค่า env เป็นชุดล่าสุดที่ stable และ redeploy
- ถ้า Stripe/SendGrid/Upstash มี outage: ปิด billing/email ที่พึ่ง provider ชั่วคราว และเปิด banner แจ้งสถานะ
- ถ้า readiness `blocked`: หยุด go-live sign-off, เปิด incident ticket, แนบหลักฐานจาก dashboard + logs แล้ววนกลับข้อ 2.2

---

## 3) งานที่ทำต่อแบบขนานได้ (Parallelizable)

ทำพร้อมกันได้ทันทีเพราะไม่ชน dependency โดยตรง:

1. Ops ตั้งค่า SendGrid + Upstash
2. Finance/Ops จัดการ Stripe live key
3. SRE/Ops ตั้งค่า Sentry DSN
4. Owner/Ops ตรวจ Supabase email verification

หลัง 1-4 เสร็จ ให้ Dev รัน smoke/readiness และปิด checklist sign-off รอบเดียว

---

## 4) สรุปสถานะเริ่มต้น

- งานค้างรวมใน TODO ปัจจุบัน: **14**
- กลุ่มที่ blocked ด้วย production/vendor access: **อย่างน้อย 5 งานหลัก** (ตามตารางข้อ 1)
- กลุ่มที่ Dev ทำต่อใน repo ได้: smoke/readiness fix และการจัดเอกสาร sign-off
