export function measureStart() {
  return Date.now();
}

export function logIfSlowQuery(name: string, startedAt: number, thresholdMs = 1200) {
  const elapsedMs = Date.now() - startedAt;
  if (elapsedMs >= thresholdMs) {
    console.warn('[slow-query]', { name, elapsedMs, thresholdMs });
  }
}
