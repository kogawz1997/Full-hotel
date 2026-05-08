'use client';

import Link from 'next/link';

export default function DestinationsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-black/10 bg-white p-6 text-center">
        <p className="text-xs tracking-wide text-[#C66A30] font-semibold">DESTINATIONS ERROR</p>
        <h1 className="mt-2 text-xl font-bold text-[#2A2522]">โหลดข้อมูลปลายทางไม่สำเร็จ</h1>
        <p className="mt-2 text-sm text-[#2A2522]/60">โปรดลองอีกครั้ง หรือกลับไปค้นหาที่พักจากหน้าแรก</p>
        <div className="mt-5 flex gap-2 justify-center">
          <button onClick={reset} className="px-4 py-2 rounded-lg bg-[#C66A30] text-white text-sm">ลองใหม่</button>
          <Link href="/search" className="px-4 py-2 rounded-lg border border-black/15 text-sm">ไปหน้าค้นหา</Link>
        </div>
      </div>
    </main>
  );
}
