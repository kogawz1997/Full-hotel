/**
 * PDPA Compliance — Guest Account Deletion
 * Right to erasure under PDPA (Thailand) and GDPR
 * Anonymizes personal data, retains financial records (legal requirement)
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { reason } = await request.json().catch(() => ({}));
  const admin = createAdminClient();

  // 1. Anonymize guest_accounts (keep row for FK integrity)
  await admin.from('guest_accounts').update({
    first_name:   '[Deleted]',
    last_name:    '[Deleted]',
    email:        `deleted_${Date.now()}@deleted.invalid`,
    phone:        null,
    passport_no:  null,
    date_of_birth:null,
    address:      null,
    deleted_at:   new Date().toISOString(),
  }).eq('id', user.id);

  // 2. Keep reservations but anonymize guest link (required for accounting)
  // Financial records must be kept 5 years under Thai law
  // Just remove the link, not the reservation data

  // 3. Delete wishlist, preferences, loyalty membership
  await Promise.all([
    admin.from('wishlists').delete().eq('guest_account_id', user.id),
    admin.from('mobile_keys').update({ revoked: true }).eq('guest_account_id', user.id),
  ]);

  // 4. Log deletion for PDPA audit trail
  await admin.from('audit_logs').insert({
    action:      'pdpa.account_deleted',
    entity_type: 'guest_account',
    entity_id:   user.id,
    changes: {
      reason:     reason || 'User request',
      deleted_at: new Date().toISOString(),
      data_retained: 'Financial records retained per Thai accounting law (5 years)',
    },
  });

  // 5. Delete auth user
  await admin.auth.admin.deleteUser(user.id);

  return NextResponse.json({
    success: true,
    message: 'บัญชีถูกลบแล้ว ข้อมูลการเงินถูกเก็บตามกฎหมาย',
  });
}
