'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { Search, MapPin, Star, Filter, X, ChevronDown, Users, Calendar, SlidersHorizontal, Heart } from 'lucide-react';
import { HotelCard } from '@/components/public/HotelCard';

const HOTEL_TYPES = [
  { value: '', label: 'ทุกประเภท' },
  { value: 'hotel', label: '🏨 Hotel' },
  { value: 'resort', label: '🌴 Resort' },
  { value: 'boutique', label: '🏡 Boutique' },
  { value: 'pool_villa', label: '🏊 Pool Villa' },
  { value: 'hostel', label: '🎒 Hostel' },
  { value: 'serviced_apartment', label: '🏢 Serviced Apt.' },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: '⭐ แนะนำ' },
  { value: 'price_asc', label: '💰 ราคาต่ำ-สูง' },
  { value: 'price_desc', label: '💰 ราคาสูง-ต่ำ' },
  { value: 'rating', label: '⭐ คะแนนสูงสุด' },
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState({
    city:      searchParams.get('city') || '',
    checkIn:   searchParams.get('checkIn') || format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    checkOut:  searchParams.get('checkOut') || format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    adults:    Number(searchParams.get('adults') || 2),
    type:      searchParams.get('type') || '',
    minPrice:  Number(searchParams.get('minPrice') || 0),
    maxPrice:  Number(searchParams.get('maxPrice') || 50000),
    minRating: Number(searchParams.get('minRating') || 0),
    sort:      searchParams.get('sort') || 'recommended',
  });

  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [searched, setSearched] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [recentViewed, setRecentViewed] = useState<any[]>([]);

  const search = useCallback(async (q = query) => {
    setLoading(true);
    setSearched(true);
    const params = new URLSearchParams({
      city: q.city, checkIn: q.checkIn, checkOut: q.checkOut,
      adults: String(q.adults), type: q.type, sort: q.sort,
      minPrice: String(q.minPrice), maxPrice: String(q.maxPrice),
      minRating: String(q.minRating),
    });
    const res = await fetch(`/api/public/search?${params}`);
    const data = await res.json();
    setHotels(data.hotels || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    if (searchParams.get('city') || searchParams.get('checkIn')) search();
    try { const raw = localStorage.getItem('recent_hotels'); if (raw) setRecentViewed(JSON.parse(raw)); } catch {}
  }, []);

  function doSearch() {
    const params = new URLSearchParams({
      city: query.city, checkIn: query.checkIn, checkOut: query.checkOut, adults: String(query.adults),
    });
    router.push(`/search?${params}`, { scroll: false });
    search();
  }



  function toggleCompare(h: any) {
    setCompareIds((prev) => prev.includes(h.id) ? prev.filter((id) => id !== h.id) : prev.length < 3 ? [...prev, h.id] : prev);
  }

  function trackRecent(h: any) {
    const next = [h, ...recentViewed.filter((x) => x.id !== h.id)].slice(0, 5);
    setRecentViewed(next);
    try { localStorage.setItem('recent_hotels', JSON.stringify(next)); } catch {}
  }

  const compareHotels = hotels.filter((h) => compareIds.includes(h.id));
  const aiRecommended = [...hotels].sort((a,b)=>(Number(b.avg_rating||0)-Number(a.avg_rating||0))).slice(0,3);
  const isLastMinute = Math.max(0, Math.round((new Date(query.checkIn).getTime()-Date.now())/86400000)) <= 3;
  const lastMinuteDeals = hotels.filter((h)=>Number(h.min_price||0)>0).slice(0,3);

  const nights = Math.max(1, Math.round(
    (new Date(query.checkOut).getTime() - new Date(query.checkIn).getTime()) / 86400000
  ));

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Top nav */}
      <nav className="bg-white border-b border-black/5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="font-serif text-xl font-bold text-[#2A2522] shrink-0">🪷 Maitri</Link>

          {/* Search bar */}
          <div className="flex-1 flex items-center gap-2 bg-[#FAF7F2] border border-black/8 rounded-xl px-3 py-1.5 max-w-3xl">
            <MapPin className="h-4 w-4 text-[#C66A30] shrink-0" />
            <input value={query.city} onChange={e => setQuery(p => ({ ...p, city: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="ค้นหาเมือง, ที่พัก..."
              className="flex-1 bg-transparent text-sm focus:outline-none min-w-0" />
            <div className="hidden md:flex items-center gap-2 border-l border-black/8 pl-3">
              <Calendar className="h-3.5 w-3.5 text-[#2A2522]/40" />
              <input type="date" value={query.checkIn}
                onChange={e => setQuery(p => ({ ...p, checkIn: e.target.value }))}
                className="text-xs bg-transparent focus:outline-none w-28 text-[#2A2522]/60" />
              <span className="text-[#2A2522]/20">→</span>
              <input type="date" value={query.checkOut}
                onChange={e => setQuery(p => ({ ...p, checkOut: e.target.value }))}
                className="text-xs bg-transparent focus:outline-none w-28 text-[#2A2522]/60" />
            </div>
            <div className="hidden md:flex items-center gap-1 border-l border-black/8 pl-3">
              <Users className="h-3.5 w-3.5 text-[#2A2522]/40" />
              <select value={query.adults} onChange={e => setQuery(p => ({ ...p, adults: Number(e.target.value) }))}
                className="text-xs bg-transparent focus:outline-none text-[#2A2522]/60">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} คน</option>)}
              </select>
            </div>
            <button onClick={doSearch} className="shrink-0 px-4 py-1.5 bg-[#C66A30] text-white rounded-lg text-sm font-medium hover:bg-[#A4522A] transition-colors">
              <Search className="h-4 w-4" />
            </button>
          </div>

          <Link href="/portal/login" className="text-sm text-[#C66A30] hover:underline shrink-0 hidden md:block">เข้าสู่ระบบ</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {HOTEL_TYPES.map(t => (
            <button key={t.value} onClick={() => { setQuery(p => ({ ...p, type: t.value })); search({ ...query, type: t.value }); }}
              className={cn('px-3 py-1.5 text-xs rounded-full border transition-all', query.type === t.value ? 'bg-[#2A2522] text-white border-[#2A2522]' : 'border-black/10 text-[#2A2522]/60 hover:border-[#2A2522]/30')}>
              {t.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <select value={query.sort} onChange={e => { setQuery(p => ({ ...p, sort: e.target.value })); search({ ...query, sort: e.target.value }); }}
              className="px-3 py-1.5 text-xs border border-black/10 rounded-full bg-white focus:outline-none text-[#2A2522]/70">
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button onClick={() => setShowFilter(p => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-black/10 rounded-full hover:bg-white transition-colors">
              <SlidersHorizontal className="h-3.5 w-3.5" /> ตัวกรอง
            </button>
          </div>
        </div>

        {/* Advanced filter */}
        {showFilter && (
          <div className="bg-white rounded-2xl border border-black/5 p-5 mb-6">
            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-medium text-[#2A2522]/60 mb-2 block">ราคาต่อคืน (บาท)</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={query.minPrice || ''} onChange={e => setQuery(p => ({ ...p, minPrice: Number(e.target.value) }))}
                    placeholder="0" className="flex-1 px-3 py-2 bg-[#FAF7F2] rounded-lg text-sm focus:outline-none" />
                  <span className="text-[#2A2522]/30">—</span>
                  <input type="number" value={query.maxPrice !== 50000 ? query.maxPrice : ''} onChange={e => setQuery(p => ({ ...p, maxPrice: Number(e.target.value) || 50000 }))}
                    placeholder="ไม่จำกัด" className="flex-1 px-3 py-2 bg-[#FAF7F2] rounded-lg text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#2A2522]/60 mb-2 block">คะแนนขั้นต่ำ</label>
                <div className="flex gap-2">
                  {[0,3,4,4.5].map(r => (
                    <button key={r} onClick={() => setQuery(p => ({ ...p, minRating: r }))}
                      className={cn('flex-1 py-2 text-xs rounded-lg border transition-all', query.minRating === r ? 'bg-[#2A2522] text-white border-[#2A2522]' : 'border-black/10 hover:border-[#2A2522]/20')}>
                      {r === 0 ? 'ทั้งหมด' : `≥ ${r}⭐`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={() => search()} className="flex-1 py-2 bg-[#C66A30] text-white rounded-lg text-sm font-medium">ค้นหา</button>
                <button onClick={() => { setQuery(p => ({ ...p, type: '', minPrice: 0, maxPrice: 50000, minRating: 0 })); setShowFilter(false); }}
                  className="px-3 py-2 border border-black/10 rounded-lg text-sm hover:bg-black/5">รีเซ็ต</button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : !searched ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-[#2A2522] mb-2">ค้นหาที่พักที่ใช่</h2>
            <p className="text-[#2A2522]/50 text-sm">ระบุเมืองและวันที่เพื่อดูห้องว่าง</p>
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">😔</div>
            <h2 className="text-lg font-bold text-[#2A2522] mb-2">ไม่พบที่พักในช่วงนี้</h2>
            <p className="text-[#2A2522]/50 text-sm mb-4">ลองเปลี่ยนวันที่หรือเงื่อนไขการค้นหา</p>
            <button onClick={() => setQuery(p => ({ ...p, type: '', minPrice: 0, maxPrice: 50000 }))}
              className="px-5 py-2 bg-[#C66A30] text-white rounded-xl text-sm font-medium">ล้างตัวกรอง</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#2A2522]/50 mb-4">
              พบ <strong className="text-[#2A2522]">{total} ที่พัก</strong>
              {query.city && ` ใน${query.city}`}
              {` · ${nights} คืน · ${query.adults} ผู้ใหญ่`}
            </p>
            {compareHotels.length > 0 && (
              <div className="mb-4 rounded-xl border border-black/10 bg-white p-4">
                <p className="text-sm font-medium mb-2">Compare hotels ({compareHotels.length}/3)</p>
                <div className="grid md:grid-cols-3 gap-3">{compareHotels.map((h)=><div key={h.id} className="border rounded-lg p-3 text-sm"><div className="font-medium">{h.name}</div><div>⭐ {h.avg_rating || '-'} · {formatCurrency(h.min_price||0)}</div></div>)}</div>
              </div>
            )}

            {recentViewed.length > 0 && (
              <div className="mb-4 rounded-xl border border-black/10 bg-white p-4"><p className="text-sm font-medium mb-2">Recently viewed hotels</p><div className="text-xs text-[#2A2522]/60">{recentViewed.map((h)=>h.name).join(' • ')}</div></div>
            )}

            <div className="mb-4 rounded-xl border border-black/10 bg-white p-4"><p className="text-sm font-medium mb-2">AI-based recommended hotels</p><div className="text-xs text-[#2A2522]/60">{aiRecommended.map((h)=>`${h.name} (${h.avg_rating || '-'})`).join(' • ')}</div></div>

            {isLastMinute && lastMinuteDeals.length > 0 && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm font-medium text-emerald-700 mb-2">Last-minute deals</p><div className="text-xs text-emerald-700">{lastMinuteDeals.map((h)=>`${h.name} เริ่ม ${formatCurrency(h.min_price||0)}`).join(' • ')}</div></div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {hotels.map(hotel => (
                <div key={hotel.id} className="space-y-2">
                  <HotelCard hotel={hotel} nights={nights} checkIn={query.checkIn} checkOut={query.checkOut} />
                  <div className="flex gap-2">
                    <button onClick={() => toggleCompare(hotel)} className="text-xs px-2 py-1 border rounded">{compareIds.includes(hotel.id) ? 'ลบออก compare' : 'เปรียบเทียบ'}</button>
                    <button onClick={() => trackRecent(hotel)} className="text-xs px-2 py-1 border rounded">บันทึกล่าสุด</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2]" />}>
      <SearchContent />
    </Suspense>
  );
}
