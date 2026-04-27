/**
 * POST /api/auth/login
 *
 * Autenticación basada en credenciales (RFC o correo + contraseña). Para
 * estudiantes y tutores se usa CURP en lugar de RFC. Cumple ADR-08
 * (federación OAuth/OIDC en producción) — este endpoint cubre el flujo
 * local hasta integrar el IdP estatal.
 *
 * Tras autenticar carga las asignaciones de rol activas y las persiste en
 * la sesión iron-session (cookie httpOnly + secure).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, or } from 'drizzle-orm';
import { db } from '@/db/client';
import { personal, asignacionesRol } from '@/db/schema';
import { verifyPassword } from '@/lib/security/password';
import { getSession } from '@/lib/security/session';
import { auditar } from '@/lib/security/audit';

export const dynamic = 'force-dynamic';

const Schema = z.object({
  identificador: z.string().min(8).max(120),
  contrasena: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'payload_invalido' }, { status: 400 });
  }

  const id = parsed.data.identificador.trim();
  const usuarios = await db
    .select()
    .from(personal)
    .where(or(eq(personal.rfc, id.toUpperCase()), eq(personal.correo, id.toLowerCase())))
    .limit(1);
  const usuario = usuarios[0];

  if (!usuario || usuario.estado !== 'ACTIVO') {
    await auditar({
      actor: id,
      accion: 'LOGIN',
      recurso: 'sesion',
      resultado: 'DENEGADO',
      mensaje: 'usuario_no_encontrado',
    }).catch(() => {});
    return NextResponse.json({ error: 'credenciales_invalidas' }, { status: 401 });
  }

  const ok = await verifyPassword(usuario.passwordHash, parsed.data.contrasena);
  if (!ok) {
    await auditar({
      actor: usuario.rfc,
      accion: 'LOGIN',
      recurso: 'sesion',
      resultado: 'DENEGADO',
      mensaje: 'contrasena_invalida',
    }).catch(() => {});
    return NextResponse.json({ error: 'credenciales_invalidas' }, { status: 401 });
  }

  const asignaciones = await db
    .select({ rol: asignacionesRol.rolCodigo, alcance: asignacionesRol.alcance })
    .from(asignacionesRol)
    .where(eq(asignacionesRol.sujeto, usuario.rfc));

  const sess = await getSession();
  sess.sujeto = usuario.rfc;
  sess.asignaciones = asignaciones.map((a) => ({ rol: a.rol, alcance: a.alcance }));
  sess.csrf = crypto.randomUUID();
  await sess.save();

  await auditar({
    actor: usuario.rfc,
    accion: 'LOGIN',
    recurso: 'sesion',
    resultado: 'OK',
    mensaje: `roles=${asignaciones.map((a) => a.rol).join(',')}`,
  }).catch(() => {});

  return NextResponse.json({
    ok: true,
    usuario: {
      rfc: usuario.rfc,
      nombre: `${usuario.nombre} ${usuario.primerApellido}`,
      correo: usuario.correo,
      roles: asignaciones.map((a) => a.rol),
    },
  });
}
