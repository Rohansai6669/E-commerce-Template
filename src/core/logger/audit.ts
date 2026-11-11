import { logger } from './index';

export interface AuditPayload {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

export function logAuditEvent(payload: AuditPayload) {
  logger.info(`[AUDIT] ${payload.action} on ${payload.resource} - Status: ${payload.status}`, {
    audit: true,
    ...payload,
  });
}
