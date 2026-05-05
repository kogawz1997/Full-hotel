import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const ROUTE_ROLES: Array<{ prefix: string; roles: string[] }> = [
  { prefix: '/dashboard/audit', roles: ['owner', 'admin'] },
  { prefix: '/dashboard/system', roles: ['owner', 'admin'] },
  { prefix: '/dashboard/launch', roles: ['owner', 'admin'] },
  { prefix: '/dashboard/go-live', roles: ['owner', 'admin'] },
  { prefix: '/dashboard/branding', roles: ['owner', 'admin'] },
  { prefix: '/dashboard/accounting', roles: ['owner', 'admin', 'manager'] },
  { prefix: '/dashboard/reports', roles: ['owner', 'admin', 'manager'] },
  { prefix: '/dashboard/rates', roles: ['owner', 'admin', 'manager'] },
  { prefix: '/dashboard/channels', roles: ['owner', 'admin', 'manager'] },
  { prefix: '/dashboard/marketing', roles: ['owner', 'admin', 'manager'] },
  { prefix: '/dashboard/fb', roles: ['owner', 'admin', 'manager'] },
  { prefix: '/dashboard/spa', roles: ['owner', 'admin', 'manager'] },
  { prefix: '/dashboard/loyalty', roles: ['owner', 'admin', 'manager'] },
  { prefix: '/dashboard/settings', roles: ['owner', 'admin', 'manager'] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // ─── Hotel staff dashboard ───────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url));
    // Make sure they're hotel staff (not a guest account)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, organization_id, role, active, onboarding_completed')
      .eq('id', user.id)
      .single();
    if (!profile) return NextResponse.redirect(new URL('/onboarding', request.url));
    if (!profile.active) return NextResponse.redirect(new URL('/auth/login?error=inactive', request.url));
    if (!profile.organization_id) return NextResponse.redirect(new URL('/onboarding', request.url));

    const { data: hotel } = await supabase
      .from('hotels')
      .select('id')
      .eq('organization_id', profile.organization_id)
      .limit(1)
      .maybeSingle();

    if (!hotel) return NextResponse.redirect(new URL('/onboarding', request.url));

    const [{ data: roomType }, { data: room }] = await Promise.all([
      supabase.from('room_types').select('id').eq('hotel_id', hotel.id).limit(1).maybeSingle(),
      supabase.from('rooms').select('id').eq('hotel_id', hotel.id).limit(1).maybeSingle(),
    ]);

    if (!profile.onboarding_completed || !roomType || !room) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    const routeRule = ROUTE_ROLES.find(rule => pathname.startsWith(rule.prefix));
    if (routeRule && !routeRule.roles.includes(profile.role || 'staff')) {
      return NextResponse.redirect(new URL('/dashboard?error=forbidden', request.url));
    }
  }

  // ─── Guest portal (account required pages) ───────────────────────
  const guestProtected = ['/portal/bookings', '/portal/profile', '/portal/wishlist'];
  if (guestProtected.some(p => pathname.startsWith(p))) {
    if (!user) {
      const redirectUrl = new URL('/portal/login', request.url);
      redirectUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    // Verify they have a guest_account row
    const { data: guestAccount } = await supabase
      .from('guest_accounts')
      .select('id')
      .eq('id', user.id)
      .single();
    if (!guestAccount) {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/portal/bookings/:path*',
    '/portal/profile/:path*',
    '/portal/wishlist/:path*',
  ],
};
