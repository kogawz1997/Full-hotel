import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminErrorsPage() {
  const admin = createAdminClient();
  const { data: events } = await admin
    .from('operational_events')
    .select('id, event_type, severity, title, details, source, resolved_at, created_at, hotels(name, organizations(name))')
    .order('created_at', { ascending: false })
    .limit(100);

  const counts = (events || []).reduce((acc: Record<string, number>, e: any) => {
    acc[e.severity] = (acc[e.severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="container max-w-7xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">← Admin</Link>
          <h1 className="text-2xl font-bold mt-2">Platform Error Dashboard</h1>
          <p className="text-sm text-muted-foreground">Operational events across all hotels.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['critical','error','warn','info'].map(k => (
          <div key={k} className="rounded-2xl border bg-card p-4">
            <div className="text-xs uppercase text-muted-foreground">{k}</div>
            <div className="text-2xl font-bold">{counts[k] || 0}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b"><th className="text-left p-3">Time</th><th className="text-left p-3">Severity</th><th className="text-left p-3">Event</th><th className="text-left p-3">Hotel</th><th className="text-left p-3">Source</th></tr></thead>
          <tbody>
            {(events || []).map((event: any) => (
              <tr key={event.id} className="border-b last:border-0">
                <td className="p-3 text-muted-foreground">{new Date(event.created_at).toLocaleString()}</td>
                <td className="p-3 font-medium">{event.severity}</td>
                <td className="p-3">{event.title || event.event_type}</td>
                <td className="p-3 text-muted-foreground">{event.hotels?.name || '-'}</td>
                <td className="p-3 text-muted-foreground">{event.source}</td>
              </tr>
            ))}
            {(!events || events.length === 0) && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No errors logged.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
