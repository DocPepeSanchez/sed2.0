/**
 * Servicio del Banco de Retos — Capa 3.
 *
 * Implementa las reglas de negocio RB-01 a RB-10:
 *  - Creación, versionamiento inmutable y workflow de revisiones
 *  - Doble revisión ciega (token opaco)
 *  - Revisión filológica obligatoria
 *  - Revisión de pertinencia cultural para la versión maya
 *  - Calibración tras pilotaje con muestra ≥ 500
 *  - Restricción de exposición ≤ 30%
 */

import { createHash, randomBytes } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { retos, retoVersiones, parametrosTri, revisiones } from '@/db/schema';
import type { Verbo } from '@/db/schema/rbac';
import { authorize, type SesionUsuario } from '@/lib/security/rbac';
import { auditar } from '@/lib/security/audit';

export interface NuevoRetoInput {
  clave: string;
  pdaId?: string;
  campo: 'L' | 'C' | 'E' | 'H';
  fase: number;
  grado: number;
  tipo:
    | 'CERRADO_OPCION_MULTIPLE'
    | 'CERRADO_SELECCION'
    | 'CERRADO_TEI'
    | 'ABIERTO_CORTO'
    | 'ABIERTO_CONSTRUIDO';
  idioma: 'spa' | 'yua';
  pareId?: string;
  tiempoEstimadoSeg?: number;
  esItemAnclaje?: boolean;
  enunciadoQti: string;
  multimedia?: Array<{ uri: string; mime: string; alt: string }>;
  procedimientoEsperado?: string;
  atributos?: string[];
  respuestaModelo?: string;
  rubrica?: Array<{ nivel: 1 | 2 | 3 | 4; descripcion: string }>;
  afirmaciones?: string[];
  claveRespuesta?: unknown;
}

function exigir(sesion: SesionUsuario, recurso: string, verbo: Verbo, contexto?: Record<string, unknown>): void {
  const r = authorize(sesion, { recurso, verbo, contexto });
  if (!r.permitido) {
    const err = new Error(`Acceso denegado: ${r.motivo}`);
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
}

/**
 * RB-01: Crea un reto en estado CREADO con su versión 1.0.0 inmutable.
 * Solo Elaborador certificado.
 */
export async function crearReto(sesion: SesionUsuario, input: NuevoRetoInput) {
  exigir(sesion, 'reto', 'C', { estado: 'CREADO' });

  const contenidoHash = createHash('sha256')
    .update(
      JSON.stringify({
        enunciadoQti: input.enunciadoQti,
        multimedia: input.multimedia ?? [],
        procedimientoEsperado: input.procedimientoEsperado ?? '',
        rubrica: input.rubrica ?? null,
        claveRespuesta: input.claveRespuesta ?? null,
      }),
    )
    .digest('hex');

  return db.transaction(async (tx) => {
    const [reto] = await tx
      .insert(retos)
      .values({
        clave: input.clave,
        pdaId: input.pdaId,
        campo: input.campo,
        fase: input.fase,
        grado: input.grado,
        tipo: input.tipo,
        idioma: input.idioma,
        pareId: input.pareId,
        elaboradorRfc: sesion.sujeto,
        estado: 'CREADO',
        tiempoEstimadoSeg: input.tiempoEstimadoSeg ?? 60,
        esItemAnclaje: input.esItemAnclaje ?? false,
      })
      .returning();

    if (!reto) throw new Error('No se pudo crear el reto.');

    const [version] = await tx
      .insert(retoVersiones)
      .values({
        retoId: reto.id,
        version: '1.0.0',
        enunciadoQti: input.enunciadoQti,
        multimedia: input.multimedia ?? [],
        procedimientoEsperado: input.procedimientoEsperado,
        atributos: input.atributos ?? [],
        respuestaModelo: input.respuestaModelo,
        rubrica: input.rubrica,
        afirmaciones: input.afirmaciones ?? [],
        claveRespuesta: input.claveRespuesta,
        contenidoHash,
        creadaPor: sesion.sujeto,
      })
      .returning();

    await auditar({
      actor: sesion.sujeto,
      accion: 'CREATE',
      recurso: 'reto',
      recursoId: reto.id,
      resultado: 'OK',
      mensaje: `Reto ${reto.clave} v1.0.0 creado.`,
    });

    return { reto, version };
  });
}

/**
 * RB-02: Registra una revisión ciega. El token opaco oculta la identidad
 * del revisor frente al otro revisor y al elaborador.
 */
export async function registrarRevision(
  sesion: SesionUsuario,
  input: {
    retoVersionId: string;
    tipo: 'CIEGA_1' | 'CIEGA_2' | 'ARBITRAJE' | 'FILOLOGICA' | 'PERTINENCIA';
    decision: 'ACEPTAR' | 'RECHAZAR' | 'MODIFICAR';
    comentarios?: string;
    hallazgos?: Array<{ severidad: 'BAJA' | 'MEDIA' | 'ALTA'; descripcion: string }>;
  },
) {
  // Mapeo tipo de revisión → estado requerido en el reto.
  const estadoRequerido: Record<typeof input.tipo, string> = {
    CIEGA_1: 'CREADO',
    CIEGA_2: 'REVISADO_1',
    ARBITRAJE: 'EN_ARBITRAJE',
    FILOLOGICA: 'REVISADO_2',
    PERTINENCIA: 'REVISADO_FILOLOGICO',
  };

  exigir(sesion, 'reto', 'U', { estado: estadoRequerido[input.tipo] });

  return db.transaction(async (tx) => {
    const [version] = await tx
      .select()
      .from(retoVersiones)
      .where(eq(retoVersiones.id, input.retoVersionId));
    if (!version) throw new Error('Versión de reto no encontrada.');

    const [reto] = await tx.select().from(retos).where(eq(retos.id, version.retoId));
    if (!reto) throw new Error('Reto no encontrado.');
    if (reto.estado !== estadoRequerido[input.tipo]) {
      throw new Error(`Estado actual ${reto.estado} no permite revisión ${input.tipo}.`);
    }

    const tokenCiego = randomBytes(16).toString('hex');

    await tx.insert(revisiones).values({
      retoVersionId: input.retoVersionId,
      tipo: input.tipo,
      revisorRfc: sesion.sujeto,
      tokenCiego,
      decision: input.decision,
      comentarios: input.comentarios,
      hallazgos: input.hallazgos ?? [],
    });

    // Avance de máquina de estados.
    const siguienteEstado = computarSiguienteEstado(reto.estado, input.tipo, input.decision, tx);
    if (siguienteEstado) {
      const estado = await siguienteEstado;
      await tx.update(retos).set({ estado, updatedAt: new Date() }).where(eq(retos.id, reto.id));
    }

    await auditar({
      actor: sesion.sujeto,
      accion: `REVISION_${input.tipo}`,
      recurso: 'reto',
      recursoId: reto.id,
      resultado: 'OK',
      mensaje: `Revisión ${input.tipo} con decisión ${input.decision}.`,
    });

    return { ok: true };
  });
}

type EstadoReto =
  | 'CREADO'
  | 'REVISADO_1'
  | 'REVISADO_2'
  | 'EN_ARBITRAJE'
  | 'REVISADO_FILOLOGICO'
  | 'EN_PILOTAJE'
  | 'PILOTEADO'
  | 'CALIBRADO'
  | 'OPERATIVO'
  | 'RETIRADO';

async function computarSiguienteEstado(
  estadoActual: string,
  tipoRevision: string,
  decision: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
): Promise<EstadoReto> {
  // RB-02: si las dos revisiones ciegas acuerdan ACEPTAR → REVISADO_2.
  // Si discrepan → EN_ARBITRAJE.
  if (tipoRevision === 'CIEGA_1' && decision === 'ACEPTAR') return 'REVISADO_1';
  if (tipoRevision === 'CIEGA_1' && decision !== 'ACEPTAR') return 'EN_ARBITRAJE';
  if (tipoRevision === 'CIEGA_2' && decision === 'ACEPTAR') return 'REVISADO_2';
  if (tipoRevision === 'CIEGA_2' && decision !== 'ACEPTAR') return 'EN_ARBITRAJE';
  if (tipoRevision === 'ARBITRAJE') return decision === 'ACEPTAR' ? 'REVISADO_2' : 'CREADO';
  if (tipoRevision === 'FILOLOGICA' && decision === 'ACEPTAR') return 'REVISADO_FILOLOGICO';
  if (tipoRevision === 'PERTINENCIA' && decision === 'ACEPTAR') return 'EN_PILOTAJE';
  // Sin transición:
  void tx;
  return estadoActual as EstadoReto;
}

/**
 * RB-05: registra calibración tras pilotaje con muestra ≥ 500.
 * RB-06: si requiere ajuste, se crea nueva versión.
 */
export async function calibrarReto(
  sesion: SesionUsuario,
  input: {
    retoVersionId: string;
    modelo: '1PL' | '2PL' | '3PL';
    a: number;
    b: number;
    c: number;
    nMuestra: number;
    errorEstandarB?: number;
    fitInfit?: number;
    fitOutfit?: number;
    dif?: Array<{ subgrupo: string; estadistico: number; pValor: number; decision: 'OK' | 'REVISAR' | 'DESCARTAR' }>;
  },
) {
  exigir(sesion, 'parametros_tri', 'C');

  if (input.nMuestra < 500) {
    throw new Error('RB-05: muestra mínima de 500 respuestas para calibración.');
  }

  return db.transaction(async (tx) => {
    // Desactivar calibraciones previas.
    await tx
      .update(parametrosTri)
      .set({ activa: false })
      .where(and(eq(parametrosTri.retoVersionId, input.retoVersionId), eq(parametrosTri.activa, true)));

    const [param] = await tx
      .insert(parametrosTri)
      .values({
        retoVersionId: input.retoVersionId,
        modelo: input.modelo,
        a: input.a.toFixed(4),
        b: input.b.toFixed(4),
        c: input.c.toFixed(4),
        nMuestra: input.nMuestra,
        errorEstandarB: input.errorEstandarB?.toFixed(4),
        fitInfit: input.fitInfit?.toFixed(4),
        fitOutfit: input.fitOutfit?.toFixed(4),
        dif: input.dif ?? [],
        calibradoPor: sesion.sujeto,
        activa: true,
      })
      .returning();

    const [version] = await tx
      .select()
      .from(retoVersiones)
      .where(eq(retoVersiones.id, input.retoVersionId));

    if (version) {
      // Si DIF severo (clasificación C), retiramos automáticamente (P-09 + RB-04).
      const tieneDifSevero = (input.dif ?? []).some((d) => d.decision === 'DESCARTAR');
      const nuevoEstado: EstadoReto = tieneDifSevero ? 'RETIRADO' : 'CALIBRADO';
      await tx
        .update(retos)
        .set({ estado: nuevoEstado, updatedAt: new Date() })
        .where(eq(retos.id, version.retoId));
    }

    await auditar({
      actor: sesion.sujeto,
      accion: 'CALIBRATE',
      recurso: 'parametros_tri',
      recursoId: param?.id,
      resultado: 'OK',
      contexto: { diff: { modelo: input.modelo, a: input.a, b: input.b, c: input.c, nMuestra: input.nMuestra } },
    });

    return param;
  });
}

/**
 * RB-07: retiro lógico — un reto nunca se borra; sus respuestas previas se conservan.
 */
export async function retirarReto(sesion: SesionUsuario, retoId: string, motivo: string) {
  exigir(sesion, 'reto', 'A');
  await db.update(retos).set({ estado: 'RETIRADO', updatedAt: new Date() }).where(eq(retos.id, retoId));
  await auditar({
    actor: sesion.sujeto,
    accion: 'RETIRE',
    recurso: 'reto',
    recursoId: retoId,
    resultado: 'OK',
    mensaje: motivo,
  });
}
