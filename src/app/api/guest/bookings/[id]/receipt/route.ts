import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: reservation } = await supabase
    .from('reservations')
    .select(`
      id, reservation_code, check_in, check_out, nights, total_amount, paid_amount, payment_status, created_at,
      guest_account_id,
      guests(first_name,last_name,email,phone),
      hotels(name,address,phone,email,tax_id),
      room_types(name),
      rooms(room_number)
    `)
    .eq('id', id)
    .single();

  if (!reservation || reservation.guest_account_id !== user.id) {
    return NextResponse.json({ error: 'ไม่พบการจอง' }, { status: 404 });
  }

  const guest = reservation.guests as any;
  const hotel = reservation.hotels as any;
  const total = Number(reservation.total_amount || 0);
  const paid = Number(reservation.paid_amount || 0);
  const balance = Math.max(0, total - paid);
  const issueDate = new Date().toLocaleDateString('th-TH');

  const html = `<!doctype html>
<html lang="th"><head><meta charset="UTF-8"/><title>Receipt ${reservation.reservation_code}</title>
<style>
body{font-family:Arial,sans-serif;padding:24px;color:#222} .box{max-width:780px;margin:auto;border:1px solid #ddd;border-radius:12px;padding:24px}
.h{display:flex;justify-content:space-between;align-items:flex-start}.muted{color:#666;font-size:12px}
table{width:100%;border-collapse:collapse;margin-top:16px}td,th{padding:8px;border-bottom:1px solid #eee;text-align:left}
.right{text-align:right}.total{font-weight:700}
@media print { .no-print{display:none} }
</style></head>
<body><div class="box">
<div class="h"><div><h2>ใบเสร็จรับเงิน / Receipt</h2><div class="muted">เลขที่: REC-${reservation.reservation_code}</div><div class="muted">วันที่ออก: ${issueDate}</div></div>
<button class="no-print" onclick="window.print()">Print / Save PDF</button></div>
<hr/>
<p><strong>โรงแรม:</strong> ${hotel?.name || '-'}<br/><span class="muted">${hotel?.address || ''}</span></p>
<p><strong>ผู้เข้าพัก:</strong> ${(guest?.first_name || '')} ${(guest?.last_name || '')}<br/><span class="muted">${guest?.email || ''}</span></p>
<table><thead><tr><th>รายการ</th><th>รายละเอียด</th><th class="right">จำนวนเงิน</th></tr></thead>
<tbody>
<tr><td>ค่าห้องพัก</td><td>${(reservation.room_types as any)?.name || '-'} · ห้อง ${(reservation.rooms as any)?.room_number || '-'} · ${reservation.nights || 1} คืน</td><td class="right">฿${total.toLocaleString()}</td></tr>
<tr><td>ชำระแล้ว</td><td>สถานะ: ${reservation.payment_status || '-'}</td><td class="right">฿${paid.toLocaleString()}</td></tr>
<tr class="total"><td colspan="2">คงเหลือ</td><td class="right">฿${balance.toLocaleString()}</td></tr>
</tbody></table>
</div></body></html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="receipt-${reservation.reservation_code}.html"`,
      'Cache-Control': 'no-store',
    },
  });
}
