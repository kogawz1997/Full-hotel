import { NextResponse } from 'next/server';
import { requireHotelAccess } from '@/lib/auth/guards';
import { createStaffLoginToken } from '@/lib/security/staff-link';

export async function POST() {
  const ctx = await requireHotelAccess(null, ['owner']);
  if (ctx.error) return ctx.error;
  if (!ctx.profile || !ctx.hotelId) return NextResponse.json({ error: 'Profile not found' }, { status: 403 });

  const appUrl = process.env.NEXT_PUBLIC_BACKOFFICE_HOST
    ? `https://${process.env.NEXT_PUBLIC_BACKOFFICE_HOST}`
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

  const token = createStaffLoginToken(ctx.hotelId, 60);
  const loginUrl = `${appUrl}/backoffice/login?hotel=${ctx.hotelId}&token=${token}`;
  return NextResponse.json({ success: true, loginUrl, hotelId: ctx.hotelId, expiresInMinutes: 60 });
}
