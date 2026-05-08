import { NextResponse } from 'next/server';

export function getRequestId(request: Request) {
  return request.headers.get('x-request-id') || crypto.randomUUID();
}

type ApiErrorContext = {
  request?: Request;
  tenantId?: string | null;
};

export function handleApiError(error: unknown, context?: ApiErrorContext, fallback = 'Internal Server Error') {
  const message = error instanceof Error ? error.message : fallback;
  const requestId = context?.request ? getRequestId(context.request) : undefined;
  const tenantId = context?.tenantId || null;
  if (requestId) {
    console.error('[api-error]', { requestId, tenantId, message });
  }
  return NextResponse.json({ error: message, requestId }, { status: 500 });
}
