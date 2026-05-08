import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const admin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const hotelId = searchParams.get('hotelId');

  let query = admin
    .from('partner_integrations')
    .select('id,hotel_id,provider,status,config,last_sync_at,created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (hotelId) query = query.eq('hotel_id', hotelId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(request: NextRequest) {
  const admin = createAdminClient();
  const body = await request.json().catch(() => ({}));

  const payload = {
    hotel_id: body.hotelId,
    provider: body.provider,
    status: body.status || 'pending',
    config: body.config || {},
    created_at: new Date().toISOString(),
  };

  const { data, error } = await admin
    .from('partner_integrations')
    .insert(payload)
    .select('id,hotel_id,provider,status,config,created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, item: data });
}
