type AlertLevel = 'info' | 'warning' | 'critical';

export async function sendOpsAlert(input: {
  level: AlertLevel;
  title: string;
  message: string;
  context?: Record<string, unknown>;
}) {
  const webhookUrl = process.env.OPS_ALERT_WEBHOOK_URL;
  const payload = {
    level: input.level,
    title: input.title,
    message: input.message,
    context: input.context || {},
    app: 'maitri-pms',
    at: new Date().toISOString(),
  };

  if (!webhookUrl) {
    console.warn('[ops-alert]', JSON.stringify(payload));
    return { delivered: false, reason: 'OPS_ALERT_WEBHOOK_URL not configured' };
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return { delivered: res.ok, status: res.status };
}
