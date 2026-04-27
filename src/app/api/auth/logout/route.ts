/**
 * POST /api/auth/logout — destruye la sesión actual.
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/security/session';
import { auditar } from '@/lib/security/audit';

export const dynamic = 'force-dynamic';

export async function POST() {
  const sess = await getSession();
  const sujeto = sess.sujeto;
  sess.destroy();
  if (sujeto) {
    await auditar({
      actor: sujeto,
      accion: 'LOGOUT',
      recurso: 'sesion',
      resultado: 'OK',
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
