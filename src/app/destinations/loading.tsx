export default function DestinationsLoading() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] py-10 px-4 animate-pulse">
      <div className="mx-auto max-w-5xl">
        <div className="h-8 w-72 bg-white/70 rounded-lg" />
        <div className="mt-3 h-4 w-96 bg-white/70 rounded" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-black/10 bg-white p-5 space-y-3">
              <div className="h-6 w-2/3 bg-[#FAF7F2] rounded" />
              <div className="h-4 w-1/3 bg-[#FAF7F2] rounded" />
              <div className="h-4 w-full bg-[#FAF7F2] rounded" />
              <div className="h-4 w-5/6 bg-[#FAF7F2] rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
