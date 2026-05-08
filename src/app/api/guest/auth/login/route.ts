import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateCsrfOrigin } from '@/lib/security/csrf';

export async function POST(request: NextRequest) {
  const csrf = validateCsrfOrigin(request);
  if (csrf.ok === false) return NextResponse.json({ error: `CSRF validation failed: ${csrf.reason}` }, { status: 403 });

  const { email, password } = await request.json();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  const { data: guestAccount } = await supabase
    .from('guest_accounts').select('id,first_name,last_name').eq('id', data.user.id).single();
  if (!guestAccount) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: 'บัญชีนี้เป็นบัญชีโรงแรม กรุณาเข้าที่ /auth/login' }, { status: 403 });
  }

  // Basic IP anomaly signal for guest sign-ins.
  const { data: recentLogins } = await supabase
    .from('audit_logs')
    .select('changes')
    .eq('user_id', data.user.id)
    .eq('action', 'guest.login')
    .order('created_at', { ascending: false })
    .limit(5);
  const knownIps = new Set(
    (recentLogins || [])
      .map((x: { changes?: { ip?: string } }) => String(x?.changes?.ip || ''))
      .filter(Boolean)
  );
  const ipAnomaly = knownIps.size > 0 && !knownIps.has(ip);

  await supabase.from('audit_logs').insert({
    user_id: data.user.id,
    action: ipAnomaly ? 'guest.login.anomaly' : 'guest.login',
    entity_type: 'guest_account',
    entity_id: data.user.id,
    changes: { ip, userAgent, ipAnomaly },
  });

  return NextResponse.json({ success: true, guest: guestAccount });
}
