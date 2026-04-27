/**
 * POST /api/v1/sesiones/{id}/respuestas
 *
 * Persiste una respuesta inmutable y actualiza θ provisional.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { registrarRespuesta } from '@/server/aplicacion/service';
import { getSession } from '@/lib/security/session';

export const dynamic = 'force-dynamic';

const Schema = z.object({
  retoId: z.string().uuid(),
  retoVersionId: z.string().uuid(),
  contenidoQti: z.unknown(),
  tiempoRespuestaSeg: z.number().int().min(0).max(7200),
  aciertoSugerido: z.union([z.literal(0), z.literal(1)]).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sess = await getSession();
  if (!sess.sujeto) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'payload_invalido', detalle: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const r = await registrarRespuesta(
      { sujeto: sess.sujeto, asignaciones: sess.asignaciones ?? [] },
      {
        sesionId: params.id,
        retoId: parsed.data.retoId,
        retoVersionId: parsed.data.retoVersionId,
        contenidoQti: parsed.data.contenidoQti,
        tiempoRespuestaSeg: parsed.data.tiempoRespuestaSeg,
        aciertoSugerido: parsed.data.aciertoSugerido,
      },
    );
    return NextResponse.json(r, { status: 201 });
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
