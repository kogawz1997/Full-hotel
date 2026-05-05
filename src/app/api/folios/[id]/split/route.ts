import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJson } from '@/lib/http/validation';
import { requireHotelAccess } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/server';

const schema = z.object({ itemIds: z.array(z.string().uuid()).min(1), note: z.string().max(500).optional().nullable() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJson(request, schema);
  if (parsed.error) return parsed.error;
  const admin = createAdminClient();
  const { data: folio } = await admin.from('folios').select('*').eq('id', id).single();
  if (!folio) return NextResponse.json({ error: 'Folio not found' }, { status: 404 });
  const ctx = await requireHotelAccess(folio.hotel_id, ['owner', 'admin', 'manager', 'front_desk']);
  if (ctx.error) return ctx.error;

  const { data: newFolio, error: createError } = await admin.from('folios').insert({
    hotel_id: folio.hotel_id,
    reservation_id: folio.reservation_id,
    status: 'open',
    split_from_folio_id: id,
  }).select().single();
  if (createError || !newFolio) return NextResponse.json({ error: createError?.message || 'Failed to create split folio' }, { status: 500 });

  const { error: moveError } = await admin.from('folio_items')
    .update({ folio_id: newFolio.id })
    .in('id', parsed.data.itemIds)
    .eq('folio_id', id);
  if (moveError) return NextResponse.json({ error: moveError.message }, { status: 500 });

  await Promise.all([
    admin.rpc('recalculate_folio_totals', { p_folio_id: id }),
    admin.rpc('recalculate_folio_totals', { p_folio_id: newFolio.id }),
  ]);
  await admin.from('audit_logs').insert({ hotel_id: folio.hotel_id, user_id: ctx.user.id, action: 'folio.split', entity_type: 'folio', entity_id: id, changes: { newFolioId: newFolio.id, itemIds: parsed.data.itemIds, note: parsed.data.note } });
  return NextResponse.json({ folio: newFolio });
}
