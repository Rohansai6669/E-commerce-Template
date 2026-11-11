import { NextRequest, NextResponse } from 'next/server';
import { logger } from './index';

export function logRequest(req: NextRequest, startTime: number, res?: NextResponse) {
  const duration = Date.now() - startTime;
  const status = res ? res.status : 'pending';
  const method = req.method;
  const url = req.nextUrl.pathname;

  logger.info(`[REQUEST] ${method} ${url} - Status: ${status} in ${duration}ms`, {
    method,
    url,
    status,
    durationMs: duration,
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
  });
}
