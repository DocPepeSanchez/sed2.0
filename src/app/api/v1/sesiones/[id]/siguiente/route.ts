/**
 * GET /api/v1/sesiones/{id}/siguiente
 *
 * Devuelve el siguiente reto adaptativo a presentar al estudiante o `null`
 * si la sesión debe terminar (RM-08).
 */

import { NextResponse } from 'next/server';
import { siguienteReto } from '@/server/aplicacion/service';
import { getSession } from '@/lib/security/session';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sess = await getSession();
  if (!sess.sujeto) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 });

  try {
    const r = await siguienteReto(
      { sujeto: sess.sujeto, asignaciones: sess.asignaciones ?? [] },
      params.id,
    );
    return NextResponse.json(r);
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
