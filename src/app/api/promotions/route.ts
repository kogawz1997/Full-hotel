import { NextRequest, NextResponse } from 'next/server';
import { requireHotelAccess } from '@/lib/auth/guards';

export async function GET(request: NextRequest) {
  const hotelId = new URL(request.url).searchParams.get('hotelId') || '';
  const ctx = await requireHotelAccess(hotelId);
  if (ctx.error) return ctx.error;
  const { data } = await ctx.supabase.from('promo_codes').select('*').eq('hotel_id', hotelId).order('created_at', { ascending: false });
  return NextResponse.json({ promos: data || [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const ctx  = await requireHotelAccess(body.hotelId, ['owner', 'admin', 'manager']);
  if (ctx.error) return ctx.error;
  const { data, error } = await ctx.supabase.from('promo_codes').insert({
    hotel_id: body.hotelId, code: body.code.toUpperCase(),
    description: body.description, discount_type: body.discountType,
    discount_value: body.discountValue, min_nights: body.minNights || 1,
    min_amount: body.minAmount || 0, valid_from: body.validFrom || null,
    valid_until: body.validUntil || null, max_uses: body.maxUses || null, active: true,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, promo: data });
}

export async function PATCH(request: NextRequest) {
  const { id, hotelId, ...updates } = await request.json();
  const ctx = await requireHotelAccess(hotelId, ['owner', 'admin', 'manager']);
  if (ctx.error) return ctx.error;
  await ctx.supabase.from('promo_codes').update(updates).eq('id', id).eq('hotel_id', hotelId);
  return NextResponse.json({ success: true });
}
