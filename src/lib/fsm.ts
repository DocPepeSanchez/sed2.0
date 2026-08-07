import type { FsmState, Session } from "./types";

// Maquina de estados finita determinista del flujo de evaluacion.
// Transiciones permitidas (estado -> estados sucesores validos).
const TRANSITIONS: Record<FsmState, FsmState[]> = {
  INICIO: ["AUTENTICADO", "ABANDONADO"],
  AUTENTICADO: ["INSTRUMENTO_CARGADO", "ABANDONADO"],
  INSTRUMENTO_CARGADO: ["ITEM_PRESENTADO", "ABANDONADO"],
  ITEM_PRESENTADO: ["PASO_1A", "ABANDONADO"],
  PASO_1A: ["PASO_1B", "ABANDONADO"],
  PASO_1B: ["PASO_1C", "ABANDONADO"],
  PASO_1C: ["COMMIT_REACTIVO", "ABANDONADO"],
  COMMIT_REACTIVO: ["AVANCE_ITEM", "ETAPA_EVALUADA", "ABANDONADO"],
  AVANCE_ITEM: ["ITEM_PRESENTADO", "ABANDONADO"],
  ETAPA_EVALUADA: ["FINALIZADO", "ITEM_PRESENTADO", "ABANDONADO"],
  FINALIZADO: [],
  ABANDONADO: [],
};

export function canTransition(from: FsmState, to: FsmState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export class InvariantError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(`${code}: ${message}`);
  }
}

// Invariantes INV-01..06 sobre la sesion.
export function checkInvariants(session: Session): void {
  // INV-01: indice del item dentro de rango [0, n]
  if (session.currentItemIndex < 0) {
    throw new InvariantError("INV-01", "indice de item negativo");
  }
  // INV-02: las respuestas comprometidas nunca exceden el indice actual
  if (session.responses.length > session.currentItemIndex + 1) {
    throw new InvariantError(
      "INV-02",
      "respuestas comprometidas exceden el item actual",
    );
  }
  // INV-03: cada reactivo se compromete una sola vez (sin duplicados)
  const ids = session.responses.map((r) => r.itemId);
  if (new Set(ids).size !== ids.length) {
    throw new InvariantError("INV-03", "reactivo comprometido mas de una vez");
  }
  // INV-04: una sesion finalizada no admite mas respuestas pendientes
  if (session.state === "FINALIZADO" && session.syncPending > 0) {
    throw new InvariantError(
      "INV-04",
      "sesion finalizada con sincronizacion pendiente",
    );
  }
  // INV-05: contador de sincronizacion no negativo
  if (session.syncPending < 0) {
    throw new InvariantError("INV-05", "syncPending negativo");
  }
  // INV-06: cada respuesta contiene los 3 pasos cognitivos
  for (const r of session.responses) {
    if (!r.step1a || !r.step1b || !r.step1c) {
      throw new InvariantError(
        "INV-06",
        `reactivo ${r.itemId} sin los 3 pasos`,
      );
    }
  }
}

export function transition(session: Session, to: FsmState): void {
  if (!canTransition(session.state, to)) {
    throw new InvariantError(
      "FSM",
      `transicion invalida ${session.state} -> ${to}`,
    );
  }
  session.state = to;
  session.updatedAt = new Date().toISOString();
  checkInvariants(session);
}
