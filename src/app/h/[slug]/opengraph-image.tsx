import { ImageResponse } from 'next/og';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: hotel } = await supabase
    .from('hotels').select('name,tagline,city,hero_image_url,avg_rating').eq('slug', slug).single();

  const name    = hotel?.name    || 'Maitri Hotel';
  const tagline = hotel?.tagline || 'Premium Thai Hospitality';
  const city    = hotel?.city    || 'Thailand';
  const heroUrl = hotel?.hero_image_url;

  return new ImageResponse(
    <div
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: '#2A2522', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Background image */}
      {heroUrl && (
        <img
          src={heroUrl}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
        />
      )}

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(42,37,34,0.95) 0%, rgba(42,37,34,0.7) 100%)',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', padding: '60px 72px', height: '100%', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#C66A30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>M</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>Maitri</span>
        </div>

        {/* Hotel info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#C66A30', fontSize: 16, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>
              📍 {city}
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 72, fontWeight: 700, color: 'white', lineHeight: 1.0, letterSpacing: -2 }}>
            {name}
          </h1>
          {tagline && (
            <p style={{ margin: 0, fontSize: 24, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
              {tagline}
            </p>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, padding: '8px 20px' }}>
            <span style={{ color: '#FFB800', fontSize: 18 }}>★</span>
            <span style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>
              {hotel?.avg_rating ? Number(hotel.avg_rating).toFixed(1) : '4.9'} / 5
            </span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>maitri.co</div>
        </div>
      </div>
    </div>,
    { ...size }
  );
}
