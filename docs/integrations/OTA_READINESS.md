# OTA Readiness Matrix

อัปเดตล่าสุด: 2026-05-07

## พร้อมใช้งาน (Ready)
- Booking.com (เมื่อมี credentials + webhook token)
- Agoda (เมื่อมี YCS API key + property id)

## รอ Vendor Approval / Coming Soon
- Airbnb
- Expedia
- Trip.com
- Hostelworld

## หมายเหตุสำคัญ
- การเชื่อมต่อ OTA ต้องใช้ API credentials จาก vendor โดยตรง
- OTA cron (`/api/cron/ota-sync`) จะข้าม channel ที่ไม่มี `api_key`/`property_id` พร้อม log ชัดเจน
