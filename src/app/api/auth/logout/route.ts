import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function performLogout(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = new URL(request.url);
  const next = url.searchParams.get('next') || '/backoffice/login';
  return NextResponse.redirect(new URL(next, request.url));
}

export async function GET(request: Request) {
  return performLogout(request);
}

export async function POST(request: Request) {
  return performLogout(request);
}
