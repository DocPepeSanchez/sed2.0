/**
 * GET /api/auth/me — devuelve el usuario actual o `null`.
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/security/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sess = await getSession();
  if (!sess.sujeto) return NextResponse.json({ usuario: null });
  return NextResponse.json({
    usuario: {
      rfc: sess.sujeto,
      asignaciones: sess.asignaciones ?? [],
    },
  });
}
