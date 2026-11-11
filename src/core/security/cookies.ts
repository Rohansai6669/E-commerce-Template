import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { securityConfig } from '../config/security';

export function getSecureCookieOptions(maxAge: number): Partial<ResponseCookie> {
  return {
    httpOnly: securityConfig.cookies.httpOnly,
    secure: securityConfig.cookies.secure,
    sameSite: securityConfig.cookies.sameSite,
    maxAge,
    path: '/',
  };
}
