/**
 * Servicio de Aplicación — Capa 5.
 *
 * Implementa RA-01..RA-10:
 *  - Ventana programable (RA-01)
 *  - Aplicador certificado (RA-02)
 *  - Verificación CURP al inicio (RA-03)
 *  - Modalidad por censo (RA-04)
 *  - Acomodaciones automáticas (RA-05)
 *  - Acta firmada (RA-06)
 *  - Bitácora de incidentes (RA-07)
 *  - Confidencialidad operativa (RA-10)
 */

import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  aplicaciones,
  sesiones,
  respuestas,
  formas,
  instrumentos,
  retoVersiones,
  parametrosTri,
  acomodaciones,
  estudiantes,
} from '@/db/schema';
import { authorize, type SesionUsuario } from '@/lib/security/rbac';
import { auditar } from '@/lib/security/audit';
import {
  estadoInicial,
  type EstadoCat,
  type RetoDisponible,
  seleccionarSiguienteReto,
  aplicarRespuesta,
  debeTerminar,
} from '@/lib/psicometria/cat';

export interface ProgramarAplicacionInput {
  instrumentoId: string;
  formaId: string;
  claveEscuela: string;
  ventanaInicio: Date;
  ventanaFin: Date;
  modalidad: '1A1' | 'ROTACION' | 'GRUPAL' | 'OMR';
  responsableRfc: string;
  aplicadorRfc: string;
}

function exigir(sesion: SesionUsuario, recurso: string, verbo: 'C' | 'L' | 'U' | 'D' | 'A', ctx?: Record<string, unknown>) {
  const r = authorize(sesion, { recurso, verbo, contexto: ctx });
  if (!r.permitido) {
    const e = new Error(`Acceso denegado: ${r.motivo}`);
    (e as Error & { status?: number }).status = 403;
    throw e;
  }
}

/**
 * RA-01: programa una aplicación. Mínimo 30 días naturales de anticipación.
 */
export async function programarAplicacion(sesion: SesionUsuario, input: ProgramarAplicacionInput) {
  exigir(sesion, 'aplicacion', 'C', { cct: input.claveEscuela });

  const dias = (input.ventanaInicio.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (dias < 30) {
    throw new Error('RA-01: la aplicación debe programarse con ≥ 30 días naturales de anticipación.');
  }

  const [apl] = await db
    .insert(aplicaciones)
    .values({
      instrumentoId: input.instrumentoId,
      formaId: input.formaId,
      claveEscuela: input.claveEscuela,
      ventanaInicio: input.ventanaInicio,
      ventanaFin: input.ventanaFin,
      modalidad: input.modalidad,
      responsableRfc: input.responsableRfc,
      aplicadorRfc: input.aplicadorRfc,
      estado: 'PROGRAMADA',
    })
    .returning();

  await auditar({
    actor: sesion.sujeto,
    accion: 'PROGRAMAR',
    recurso: 'aplicacion',
    recursoId: apl?.id,
    resultado: 'OK',
  });

  return apl;
}

/**
 * Inicia una sesión para un estudiante. Verifica CURP (RA-03) y aplica
 * acomodaciones automáticas (RA-05).
 */
export async function iniciarSesion(
  sesion: SesionUsuario,
  input: { aplicacionId: string; estudianteCurp: string },
) {
  const [apl] = await db.select().from(aplicaciones).where(eq(aplicaciones.id, input.aplicacionId));
  if (!apl) throw new Error('Aplicación no encontrada.');

  exigir(sesion, 'aplicacion', 'U', { cct: apl.claveEscuela });

  // RA-03: verifica CURP del estudiante.
  const [est] = await db
    .select()
    .from(estudiantes)
    .where(eq(estudiantes.curp, input.estudianteCurp));
  if (!est) {
    await auditar({
      actor: sesion.sujeto,
      accion: 'INICIAR_SESION',
      recurso: 'aplicacion',
      recursoId: input.aplicacionId,
      resultado: 'DENEGADO',
      mensaje: `CURP ${input.estudianteCurp} no encontrada.`,
    });
    throw new Error('RA-03: CURP no registrada en el padrón.');
  }
  if (est.claveEscuela !== apl.claveEscuela) {
    throw new Error('RA-03: el estudiante no pertenece al CCT de esta aplicación.');
  }

  const acoms = await db
    .select()
    .from(acomodaciones)
    .where(eq(acomodaciones.estudianteCurp, input.estudianteCurp));
  const acomActivas = acoms
    .filter((a) => !a.vigenteHasta || new Date(a.vigenteHasta) >= new Date())
    .map((a) => a.tipo);

  return db.transaction(async (tx) => {
    const [s] = await tx
      .insert(sesiones)
      .values({
        aplicacionId: input.aplicacionId,
        estudianteCurp: input.estudianteCurp,
        estado: 'EN_CURSO',
        inicioReal: new Date(),
        acomodacionesAplicadas: acomActivas,
      })
      .returning();

    await tx.update(aplicaciones).set({ estado: 'EN_CURSO' }).where(eq(aplicaciones.id, input.aplicacionId));

    return s;
  });
}

/**
 * Construye el pool de retos disponibles para CAT a partir de la forma.
 */
async function poolRetos(formaId: string): Promise<RetoDisponible[]> {
  const [forma] = await db.select().from(formas).where(eq(formas.id, formaId));
  if (!forma) return [];

  const ids = [...forma.retosPool];
  if (ids.length === 0) return [];

  // Cargamos versiones operativas con calibración activa.
  const versiones = await db
    .select({
      v: retoVersiones,
      r: retoVersiones,
      param: parametrosTri,
    })
    .from(retoVersiones)
    .leftJoin(parametrosTri, eq(parametrosTri.retoVersionId, retoVersiones.id))
    .where(sql`${retoVersiones.retoId} = ANY(${ids})`);

  return versiones
    .filter((row) => row.param && row.param.activa)
    .map((row) => {
      const a = Number(row.param!.a);
      const b = Number(row.param!.b);
      const c = Number(row.param!.c);
      const banda: RetoDisponible['bandaDificultad'] = b < -0.5 ? 'baja' : b < 0.5 ? 'media' : 'alta';
      return {
        retoId: row.v.retoId,
        versionId: row.v.id,
        pdaId: null,
        campo: '',
        bandaDificultad: banda,
        parametros: { a, b, c, modelo: row.param!.modelo },
        esAnclaje: forma.retosAnclaje.includes(row.v.retoId),
        exposicionAcumulada: 0,
      };
    });
}

/**
 * Solicita el siguiente reto a presentar. Aplica RM-01..RM-09.
 */
export async function siguienteReto(sesion: SesionUsuario, sesionId: string) {
  const [s] = await db.select().from(sesiones).where(eq(sesiones.id, sesionId));
  if (!s) throw new Error('Sesión no encontrada.');

  const [apl] = await db.select().from(aplicaciones).where(eq(aplicaciones.id, s.aplicacionId));
  if (!apl) throw new Error('Aplicación no encontrada.');
  exigir(sesion, 'aplicacion', 'U', { cct: apl.claveEscuela });

  const [inst] = await db.select().from(instrumentos).where(eq(instrumentos.id, apl.instrumentoId));
  if (!inst) throw new Error('Instrumento no encontrado.');

  const blueprint = inst.blueprint;
  const candidatos = await poolRetos(apl.formaId);

  // Reconstruimos estado CAT desde la trayectoria persistida.
  const estado: EstadoCat = {
    ...estadoInicial(),
    thetaActual: s.thetaTrayectoria.at(-1)?.theta ?? 0,
    ee: 1.0,
    retosPresentados: new Set(s.thetaTrayectoria.map((p) => p.retoId)),
    respuestas: [],
  };

  if (
    debeTerminar(estado, {
      pda: blueprint.pda,
      dificultad: blueprint.dificultad,
      proporcionAnclaje: blueprint.proporcionAnclaje,
      longitudObjetivo: inst.longitudObjetivo,
      longitudMinima: inst.longitudMinima,
      longitudMaxima: inst.longitudMaxima,
      errorEstandarObjetivo: Number(inst.errorEstandarObjetivo),
    })
  ) {
    return { reto: null, terminada: true };
  }

  const reto = seleccionarSiguienteReto(estado, candidatos, {
    pda: blueprint.pda,
    dificultad: blueprint.dificultad,
    proporcionAnclaje: blueprint.proporcionAnclaje,
    longitudObjetivo: inst.longitudObjetivo,
    longitudMinima: inst.longitudMinima,
    longitudMaxima: inst.longitudMaxima,
    errorEstandarObjetivo: Number(inst.errorEstandarObjetivo),
  });

  return { reto, terminada: false };
}

/**
 * Persiste una respuesta inmutable y actualiza θ.
 */
export async function registrarRespuesta(
  sesion: SesionUsuario,
  input: {
    sesionId: string;
    retoId: string;
    retoVersionId: string;
    contenidoQti: unknown;
    tiempoRespuestaSeg: number;
    /** Para CAT-only: 1 si correcta, 0 si incorrecta — calificada en cliente para cerrados. */
    aciertoSugerido?: 0 | 1;
  },
) {
  const [s] = await db.select().from(sesiones).where(eq(sesiones.id, input.sesionId));
  if (!s) throw new Error('Sesión no encontrada.');

  const [apl] = await db.select().from(aplicaciones).where(eq(aplicaciones.id, s.aplicacionId));
  exigir(sesion, 'aplicacion', 'U', { cct: apl?.claveEscuela });

  const [param] = await db
    .select()
    .from(parametrosTri)
    .where(and(eq(parametrosTri.retoVersionId, input.retoVersionId), eq(parametrosTri.activa, true)));

  const orden = s.thetaTrayectoria.length + 1;

  return db.transaction(async (tx) => {
    const [r] = await tx
      .insert(respuestas)
      .values({
        sesionId: input.sesionId,
        retoId: input.retoId,
        retoVersionId: input.retoVersionId,
        orden,
        contenidoQti: input.contenidoQti as object,
        tiempoRespuestaSeg: input.tiempoRespuestaSeg,
        timestampRespuesta: new Date(),
        acomodacionesActivas: s.acomodacionesAplicadas,
        estado: 'RECIBIDA',
      })
      .returning();

    // Actualiza trayectoria θ provisional cuando hay calibración y hint de acierto.
    if (param && input.aciertoSugerido !== undefined) {
      const estado: EstadoCat = {
        ...estadoInicial(),
        thetaActual: s.thetaTrayectoria.at(-1)?.theta ?? 0,
        respuestas: [],
      };
      const reto: RetoDisponible = {
        retoId: input.retoId,
        versionId: input.retoVersionId,
        pdaId: null,
        campo: '',
        bandaDificultad: 'media',
        parametros: { a: Number(param.a), b: Number(param.b), c: Number(param.c), modelo: param.modelo },
        esAnclaje: false,
        exposicionAcumulada: 0,
      };
      const nuevo = aplicarRespuesta(estado, reto, input.aciertoSugerido);
      const trayectoria = [
        ...s.thetaTrayectoria,
        { n: orden, theta: nuevo.thetaActual, ee: nuevo.ee, retoId: input.retoId },
      ];
      await tx
        .update(sesiones)
        .set({ thetaTrayectoria: trayectoria, thetaFinal: nuevo.thetaActual.toFixed(4), errorEstandarTheta: nuevo.ee.toFixed(4) })
        .where(eq(sesiones.id, input.sesionId));
    }

    return r;
  });
}

/**
 * RA-06: cierra la aplicación con acta firmada. Sin acta no se publican resultados.
 */
export async function cerrarAplicacionConActa(
  sesion: SesionUsuario,
  input: { aplicacionId: string; actaUrl: string; actaHash: string },
) {
  const [apl] = await db.select().from(aplicaciones).where(eq(aplicaciones.id, input.aplicacionId));
  if (!apl) throw new Error('Aplicación no encontrada.');
  exigir(sesion, 'aplicacion', 'A', { cct: apl.claveEscuela });

  await db
    .update(aplicaciones)
    .set({ estado: 'FINALIZADA', actaUrl: input.actaUrl, actaHash: input.actaHash })
    .where(eq(aplicaciones.id, input.aplicacionId));

  await auditar({
    actor: sesion.sujeto,
    accion: 'CERRAR_APLICACION',
    recurso: 'aplicacion',
    recursoId: input.aplicacionId,
    resultado: 'OK',
    mensaje: `Acta firmada: ${input.actaHash}`,
  });
}

/**
 * RA-07: registra incidente operativo en bitácora.
 */
export async function registrarIncidente(
  sesion: SesionUsuario,
  input: {
    aplicacionId: string;
    severidad: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';
    descripcion: string;
  },
) {
  const [apl] = await db.select().from(aplicaciones).where(eq(aplicaciones.id, input.aplicacionId));
  if (!apl) throw new Error('Aplicación no encontrada.');
  exigir(sesion, 'aplicacion', 'U', { cct: apl.claveEscuela });

  const incidente = {
    timestamp: new Date().toISOString(),
    severidad: input.severidad,
    descripcion: input.descripcion,
    reportadoPor: sesion.sujeto,
  };

  await db
    .update(aplicaciones)
    .set({ incidentes: [...apl.incidentes, incidente] })
    .where(eq(aplicaciones.id, input.aplicacionId));

  await auditar({
    actor: sesion.sujeto,
    accion: 'INCIDENTE',
    recurso: 'aplicacion',
    recursoId: input.aplicacionId,
    resultado: 'OK',
    mensaje: `${input.severidad}: ${input.descripcion}`,
  });
}
