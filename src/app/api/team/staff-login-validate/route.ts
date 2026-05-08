import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJson } from '@/lib/http/validation';
import { consumeStaffLoginToken } from '@/lib/security/staff-link';

const schema = z.object({ token: z.string().min(10) });

export async function POST(request: Request) {
  const parsed = await parseJson(request, schema);
  if (parsed.error) return parsed.error;

  const result = consumeStaffLoginToken(parsed.data.token);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ success: true, hotelId: result.hotelId, exp: result.exp });
}
