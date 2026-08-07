import { randomUUID } from "node:crypto";
import { appendAudit } from "./audit";
import { checkInvariants, transition } from "./fsm";
import { fisherYates } from "./rng";
import { db, recordSyncEvent } from "./store";
import type { Item, Session } from "./types";

export class FlowError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
  }
}

// Autentica un token de estudiante (one-time) y crea la sesion.
export function startStudentSession(token: string): Session {
  const d = db();
  if (!d.window.open) {
    throw new FlowError(403, "La ventana de aplicación está cerrada.");
  }
  const t = d.tokens.get(token);
  if (!t) throw new FlowError(401, "Token inválido.");
  if (t.used) throw new FlowError(409, "El token ya fue utilizado.");

  const instrument = d.instruments.get(t.instrumentId);
  if (!instrument) throw new FlowError(500, "Instrumento no encontrado.");

  t.used = true;

  const now = new Date().toISOString();
  const session: Session = {
    id: randomUUID(),
    studentId: t.studentId,
    instrumentId: instrument.id,
    bank: instrument.bank,
    state: "INICIO",
    currentItemIndex: 0,
    responses: [],
    online: true,
    syncPending: 0,
    createdAt: now,
    updatedAt: now,
  };
  d.sessions.set(session.id, session);

  transition(session, "AUTENTICADO");
  transition(session, "INSTRUMENTO_CARGADO");
  transition(session, "ITEM_PRESENTADO");

  appendAudit(d.audit, {
    actor: session.studentId,
    action: "SESSION_START",
    detail: `instrumento=${instrument.id} banco=${instrument.bank}`,
    syncEventId: `start-${session.id}`,
  });

  return session;
}

export function getSession(id: string): Session {
  const s = db().sessions.get(id);
  if (!s) throw new FlowError(404, "Sesión no encontrada.");
  return s;
}

function instrumentItems(session: Session): Item[] {
  const d = db();
  const inst = d.instruments.get(session.instrumentId)!;
  return inst.itemIds.map((id) => d.items.get(id)!);
}

export interface PresentedItem {
  index: number;
  total: number;
  item: Item;
  // orden barajado de opciones 1B (Fisher-Yates)
  order1b: string[];
}

export function presentCurrentItem(session: Session): PresentedItem {
  const items = instrumentItems(session);
  if (session.currentItemIndex >= items.length) {
    throw new FlowError(409, "No hay más reactivos.");
  }
  const item = items[session.currentItemIndex];
  const order1b = fisherYates(item.step1b.options.map((o) => o.id));
  return {
    index: session.currentItemIndex,
    total: items.length,
    item,
    order1b,
  };
}

export interface CommitInput {
  itemId: string;
  step1a: string;
  step1b: string;
  step1c: string;
  presentedOrder1b: string[];
  startedAt: string;
  syncEventId: string;
}

// Commit transaccional ACID de los 3 pasos como unidad atomica.
export function commitItem(session: Session, input: CommitInput): Session {
  const d = db();

  // Idempotencia por sync_event_id UNIQUE
  if (!recordSyncEvent(input.syncEventId)) {
    return session; // ya aplicado, no-op
  }

  const items = instrumentItems(session);
  const expected = items[session.currentItemIndex];
  if (!expected || expected.id !== input.itemId) {
    d.seenSyncEvents.delete(input.syncEventId);
    throw new FlowError(409, "Reactivo fuera de secuencia.");
  }
  if (!input.step1b) {
    d.seenSyncEvents.delete(input.syncEventId);
    throw new FlowError(400, "Falta el paso 1B.");
  }
  if (!input.step1c) {
    d.seenSyncEvents.delete(input.syncEventId);
    throw new FlowError(400, "Falta el paso 1C.");
  }

  // Snapshot para rollback (atomicidad)
  const snapshot = {
    state: session.state,
    currentItemIndex: session.currentItemIndex,
    responsesLen: session.responses.length,
  };

  try {
    transition(session, "PASO_1A");
    transition(session, "PASO_1B");
    transition(session, "PASO_1C");
    transition(session, "COMMIT_REACTIVO");

    session.responses.push({
      itemId: input.itemId,
      step1a: input.step1a,
      step1b: input.step1b,
      step1c: input.step1c,
      presentedOrder1b: input.presentedOrder1b,
      startedAt: input.startedAt,
      committedAt: new Date().toISOString(),
    });
    checkInvariants(session);

    const isLast = session.currentItemIndex >= items.length - 1;
    if (isLast) {
      transition(session, "ETAPA_EVALUADA");
      transition(session, "FINALIZADO");
      session.finishedAt = new Date().toISOString();
    } else {
      transition(session, "AVANCE_ITEM");
      session.currentItemIndex += 1;
      transition(session, "ITEM_PRESENTADO");
    }
  } catch (e) {
    // rollback
    session.state = snapshot.state;
    session.currentItemIndex = snapshot.currentItemIndex;
    session.responses.length = snapshot.responsesLen;
    d.seenSyncEvents.delete(input.syncEventId);
    throw e;
  }

  appendAudit(d.audit, {
    actor: session.studentId,
    action: "COMMIT_ITEM",
    detail: `item=${input.itemId} estado=${session.state}`,
    syncEventId: input.syncEventId,
  });

  return session;
}
