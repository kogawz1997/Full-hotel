export function validateCsrfOrigin(request: Request): { ok: true } | { ok: false; reason: string } {
  const method = request.method.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return { ok: true };

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return { ok: false, reason: 'Missing origin/host header' };

  try {
    const originHost = new URL(origin).host;
    if (originHost !== host) return { ok: false, reason: 'Origin mismatch' };
    return { ok: true };
  } catch {
    return { ok: false, reason: 'Invalid origin header' };
  }
}
