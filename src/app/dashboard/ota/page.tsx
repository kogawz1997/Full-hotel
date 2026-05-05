import { requireHotelAccess } from '@/lib/auth/guards';

export default async function OtaPage() {
  const ctx = await requireHotelAccess(null, ['owner', 'admin', 'manager']);
  if (ctx.error) return <div className="p-6">Unauthorized</div>;

  const { data: connections } = await ctx.supabase
    .from('ota_connections')
    .select('*')
    .eq('hotel_id', ctx.hotelId)
    .order('created_at', { ascending: false });

  const { data: logs } = await ctx.supabase
    .from('ota_sync_logs')
    .select('*')
    .eq('hotel_id', ctx.hotelId)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <p className="text-sm text-muted-foreground">Phase 5</p>
        <h1 className="text-2xl font-semibold tracking-tight">OTA Sync Foundation</h1>
        <p className="text-sm text-muted-foreground">เตรียมฐานสำหรับ Booking.com, Agoda, Expedia และ channel อื่น ๆ ก่อนใส่ credential จริง</p>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-semibold">Connections</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground"><tr><th className="py-2">Provider</th><th>Property ID</th><th>Status</th><th>Rates</th><th>Inventory</th><th>Reservations</th></tr></thead>
            <tbody>
              {(connections || []).map((c: any) => <tr key={c.id} className="border-t"><td className="py-2">{c.provider}</td><td>{c.external_property_id}</td><td>{c.status}</td><td>{c.sync_rates ? 'On' : 'Off'}</td><td>{c.sync_inventory ? 'On' : 'Off'}</td><td>{c.sync_reservations ? 'On' : 'Off'}</td></tr>)}
              {!connections?.length && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">ยังไม่มี OTA connection</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-semibold">Sync Logs</h2>
        <div className="space-y-2">
          {(logs || []).map((log: any) => <div key={log.id} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>{log.provider} · {log.direction} · {log.status}</span><span className="text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span></div>)}
          {!logs?.length && <p className="text-sm text-muted-foreground">ยังไม่มี sync log</p>}
        </div>
      </div>
    </div>
  );
}
