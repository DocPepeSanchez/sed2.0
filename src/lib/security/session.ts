/**
 * Gestión de sesiones — iron-session con cookies httpOnly + secure.
 *
 * Cumple ISO 27001 (cifrado en tránsito), ADR-08 (OAuth/OIDC para
 * federación externa) y P-06 (mínimo privilegio: la sesión expone solo
 * lo necesario).
 */

import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  sujeto?: string;
  asignaciones?: Array<{ rol: string; alcance: { tipo: string; valor?: string } }>;
  csrf?: string;
  /** Marca de tiempo de la última verificación de MFA (Zero Trust). */
  mfaVerificadoEn?: number;
}

export const sessionOptions: SessionOptions = {
  cookieName: 'sed_session',
  password: process.env.SESSION_SECRET ?? 'dev-only-secret-change-me-please-change-me-for-real',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 horas
  },
};

export async function getSession() {
  const cookieStore = cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireSession(): Promise<SessionData & { sujeto: string }> {
  const sess = await getSession();
  if (!sess.sujeto) {
    throw new Error('UNAUTHORIZED');
  }
  return sess as SessionData & { sujeto: string };
}
