import { appConfig } from '../config/app';
import { securityConfig } from '../config/security';

export function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (appConfig.isDevelopment && origin.startsWith('http://localhost:')) {
    return true;
  }
  return securityConfig.cors.allowedOrigins.includes(origin);
}
