export type ReadinessCheck = { ok: boolean; message: string; latencyMs?: number };

export function deriveReadinessStatus(checks: Record<string, ReadinessCheck>) {
  const allOk = Object.values(checks).every((c) => c.ok);
  const requiredOk = Boolean(checks.environment?.ok);
  const dbChecks = ['database', 'operational_events', 'billing_tables', 'automation_tables', 'audit_logs'];
  const dbOk = dbChecks.every((key) => Boolean(checks[key]?.ok));
  return allOk ? 'ready' : (requiredOk && !dbOk ? 'degraded' : 'blocked');
}
