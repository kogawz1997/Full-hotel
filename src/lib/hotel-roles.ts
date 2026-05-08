export const HOTEL_ROLES = [
  'admin',
  'manager',
  'front_desk',
  'housekeeping',
  'maintenance',
  'concierge',
  'security',
  'accounting',
  'staff',
] as const;

export type HotelRole = (typeof HOTEL_ROLES)[number];

export const HOTEL_ROLE_LABEL: Record<HotelRole, string> = {
  admin: 'แอดมินโรงแรม',
  manager: 'ผู้จัดการ',
  front_desk: 'พนักงานต้อนรับ',
  housekeeping: 'แม่บ้าน',
  maintenance: 'พนักงานซ่อม',
  concierge: 'คอนเซียร์จ',
  security: 'พนักงานรักษาความปลอดภัย',
  accounting: 'พนักงานบัญชี',
  staff: 'พนักงานทั่วไป',
};
