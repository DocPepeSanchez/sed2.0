/**
 * Bus de eventos — Capa 7 (Ecosistema), ADR-04.
 *
 * Catálogo de eventos publicados por el SED 2.0 (Parte II §25):
 *   estudiante.creado, estudiante.movido, reto.publicado,
 *   instrumento.aplicado, respuesta.calificada, resultado.generado,
 *   alerta.estudiante, intervencion.registrada, observacion.realizada,
 *   programa.analitico.actualizado.
 *
 * En desarrollo se usa un bus en memoria; en producción Kafka/RabbitMQ a
 * través del adaptador `EVENT_BUS_URL`.
 */

export type EventoSed =
  | 'estudiante.creado'
  | 'estudiante.movido'
  | 'reto.publicado'
  | 'instrumento.aplicado'
  | 'respuesta.calificada'
  | 'resultado.generado'
  | 'alerta.estudiante'
  | 'intervencion.registrada'
  | 'observacion.realizada'
  | 'programa.analitico.actualizado';

export interface EventEnvelope<T = unknown> {
  tipo: EventoSed;
  id: string;
  timestamp: string;
  origen: string;
  payload: T;
  /** Idempotencia — los consumidores deben deduplicar por este id. */
  correlationId?: string;
  /** Trazabilidad request → evento. */
  causationId?: string;
}

type Handler = (e: EventEnvelope) => Promise<void> | void;

const handlers = new Map<EventoSed, Set<Handler>>();
const cola: EventEnvelope[] = [];

export function suscribir(tipo: EventoSed, h: Handler): () => void {
  const set = handlers.get(tipo) ?? new Set();
  set.add(h);
  handlers.set(tipo, set);
  return () => set.delete(h);
}

export async function publicar<T>(tipo: EventoSed, payload: T, ctx: { origen: string; correlationId?: string } = { origen: 'sed' }): Promise<void> {
  const e: EventEnvelope<T> = {
    tipo,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    origen: ctx.origen,
    correlationId: ctx.correlationId,
    payload,
  };
  cola.push(e);
  const set = handlers.get(tipo);
  if (set) {
    await Promise.all([...set].map((h) => h(e)));
  }
}

export function colaSnapshot(): EventEnvelope[] {
  return [...cola];
}
