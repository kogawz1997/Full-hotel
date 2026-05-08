import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/auth/guards';
import { forecastRevenue, predictOccupancy, pricingSuggestion, routeIntent, shouldEscalate, suggestedReply } from '@/lib/ai/assistant.js';

export async function POST(request: Request) {
  const auth = await requirePlatformAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const intent = routeIntent(body.message || '');
  const escalate = shouldEscalate(intent, body.sentiment || 'neutral');

  return NextResponse.json({
    success: true,
    intentRouting: { intent },
    escalation: { required: escalate, queue: escalate ? 'human_support' : null },
    suggestedReplies: { text: suggestedReply(intent) },
    revenueForecasting: { nextPeriods: forecastRevenue({ baseRevenue: Number(body.baseRevenue || 0), growthRate: Number(body.growthRate || 0.05), periods: Number(body.periods || 3) }) },
    occupancyPrediction: { predicted: predictOccupancy({ current: Number(body.currentOccupancy || 0.6), leadDemand: Number(body.leadDemand || 0.1), seasonality: Number(body.seasonality || 0) }) },
    pricingAssistant: pricingSuggestion({ baseRate: Number(body.baseRate || 1000), occupancy: Number(body.currentOccupancy || 0.6) }),
  });
}
