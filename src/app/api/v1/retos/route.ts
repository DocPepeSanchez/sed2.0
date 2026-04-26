/**
 * /api/v1/retos
 *
 * GET   — lista retos (paginado).
 * POST  — crea reto en estado CREADO. Requiere rol Elaborador.
 *
 * OAuth 2.1 + OIDC (ADR-08). Se valida sesión iron-session simplificada.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db/client';
import { retos } from '@/db/schema';
import { sql, desc } from 'drizzle-orm';
import { crearReto } from '@/server/banco/service';
import { getSession } from '@/lib/security/session';

export const dynamic = 'force-dynamic';

const PaginadoSchema = z.object({
  limite: z.coerce.number().int().min(1).max(200).default(50),
  desde: z.coerce.number().int().min(0).default(0),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = PaginadoSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!params.success) {
    return NextResponse.json({ error: 'parametros_invalidos', detalle: params.error.flatten() }, { status: 400 });
  }
  const { limite, desde } = params.data;
  const filas = await db.select().from(retos).orderBy(desc(retos.createdAt)).limit(limite).offset(desde);
  const [{ total }] = (await db.select({ total: sql<number>`count(*)::int` }).from(retos)) as Array<{
    total: number;
  }>;
  return NextResponse.json({ datos: filas, paginacion: { limite, desde, total } });
}

const NuevoRetoSchema = z.object({
  clave: z.string().min(5).max(40),
  pdaId: z.string().uuid().optional(),
  campo: z.enum(['L', 'C', 'E', 'H']),
  fase: z.number().int().min(1).max(6),
  grado: z.number().int().min(0).max(12),
  tipo: z.enum([
    'CERRADO_OPCION_MULTIPLE',
    'CERRADO_SELECCION',
    'CERRADO_TEI',
    'ABIERTO_CORTO',
    'ABIERTO_CONSTRUIDO',
  ]),
  idioma: z.enum(['spa', 'yua']).default('spa'),
  pareId: z.string().uuid().optional(),
  tiempoEstimadoSeg: z.number().int().min(10).max(900).default(60),
  esItemAnclaje: z.boolean().default(false),
  enunciadoQti: z.string().min(10),
  multimedia: z
    .array(z.object({ uri: z.string(), mime: z.string(), alt: z.string().min(3) }))
    .optional(),
  procedimientoEsperado: z.string().optional(),
  atributos: z.array(z.string()).optional(),
  respuestaModelo: z.string().optional(),
  rubrica: z
    .array(z.object({ nivel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]), descripcion: z.string() }))
    .optional(),
  afirmaciones: z.array(z.string()).optional(),
  claveRespuesta: z.unknown().optional(),
});

export async function POST(req: Request) {
  const sess = await getSession();
  if (!sess.sujeto) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = NuevoRetoSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'payload_invalido', detalle: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const r = await crearReto(
      { sujeto: sess.sujeto, asignaciones: sess.asignaciones ?? [] },
      parsed.data,
    );
    return NextResponse.json(r, { status: 201 });
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json({ error: 'error', mensaje: e.message }, { status: e.status ?? 500 });
  }
}
