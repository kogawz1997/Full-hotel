'use client';

import Link from 'next/link';

export default function SearchError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-black/10 bg-white p-6 text-center">
        <p className="text-xs tracking-wide text-[#C66A30] font-semibold">SEARCH ERROR</p>
        <h1 className="mt-2 text-xl font-bold text-[#2A2522]">เกิดข้อผิดพลาดในการค้นหา</h1>
        <p className="mt-2 text-sm text-[#2A2522]/60">{error.message || 'กรุณาลองใหม่อีกครั้ง'}</p>
        <div className="mt-5 flex gap-2 justify-center">
          <button onClick={reset} className="px-4 py-2 rounded-lg bg-[#C66A30] text-white text-sm">ลองใหม่</button>
          <Link href="/" className="px-4 py-2 rounded-lg border border-black/15 text-sm">กลับหน้าแรก</Link>
        </div>
      </div>
    </main>
  );
}
