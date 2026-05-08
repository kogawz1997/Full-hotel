import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

function code() {
  return `MTR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('referral_codes')
    .select('id, code, owner_guest_id, reward_type, reward_value, active, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ referrals: data || [] });
}

export async function POST(request: NextRequest) {
  const admin = createAdminClient();
  const body = await request.json().catch(() => ({}));

  if (body.action === 'create') {
    const payload = {
      code: code(),
      owner_guest_id: body.ownerGuestId || null,
      reward_type: body.rewardType || 'percent',
      reward_value: Number(body.rewardValue || 10),
      active: true,
    };
    const { data, error } = await admin.from('referral_codes').insert(payload).select('id, code').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, referral: data });
  }

  if (body.action === 'apply') {
    const referralCode = String(body.code || '').trim().toUpperCase();
    const { data: referral, error } = await admin
      .from('referral_codes')
      .select('id, code, reward_type, reward_value, active')
      .eq('code', referralCode)
      .eq('active', true)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!referral) return NextResponse.json({ valid: false, error: 'Referral code invalid' }, { status: 404 });

    return NextResponse.json({ valid: true, referral });
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
