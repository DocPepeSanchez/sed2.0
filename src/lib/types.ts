// Dominio SED — tipos centrales (E5 Documentacion Funcional de Flujos)

export type Role = "ROLE_STUDENT" | "ROLE_PILOT_ADMIN";

export type Bank = "A" | "B"; // A = Plan 2022 NEM · B = MCCEMS 21/08/25

// Triple coordenada cognitiva
export type FacioneSkill =
  | "interpretacion"
  | "analisis"
  | "evaluacion"
  | "inferencia"
  | "explicacion"
  | "autorregulacion";

export type CognitiveLevel =
  | "recordar"
  | "comprender"
  | "aplicar"
  | "analizar"
  | "evaluar"
  | "crear";

export type KnowledgeType =
  | "factual"
  | "conceptual"
  | "procedimental"
  | "metacognitivo";

export type MetacognitiveComponent =
  | "conocimiento"
  | "monitoreo"
  | "control"
  | "reflexion";

export interface CognitiveCoordinate {
  facione: FacioneSkill;
  nivel: CognitiveLevel;
  tipoConocimiento: KnowledgeType;
  metacognicion: MetacognitiveComponent;
}

// Reactivo: cada item se responde en 3 pasos cognitivos
export interface Item {
  id: string;
  bank: Bank;
  stem: string; // enunciado del reactivo
  coordinate: CognitiveCoordinate;
  // Paso 1A — produccion abierta / generativa
  step1a: {
    prompt: string;
  };
  // Paso 1B — reconocimiento / discriminativa
  step1b: {
    prompt: string;
    options: { id: string; text: string }[];
    correctOptionId: string;
  };
  // Paso 1C — autorreporte procedimental
  step1c: {
    prompt: string;
    options: { id: string; text: string; value: number }[]; // escala
  };
}

export interface Instrument {
  id: string;
  name: string;
  bank: Bank; // no se mezclan bancos en un instrumento
  itemIds: string[];
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string; // scrypt
  role: "ROLE_PILOT_ADMIN";
}

export interface StudentToken {
  token: string; // one-time
  studentId: string;
  instrumentId: string;
  used: boolean;
  createdAt: string;
}

// Ventana de aplicacion
export interface EvaluationWindow {
  id: string;
  opensAt: string;
  closesAt: string;
  open: boolean;
}

// Estado de la maquina de estados finita determinista
export type FsmState =
  | "INICIO"
  | "AUTENTICADO"
  | "INSTRUMENTO_CARGADO"
  | "ITEM_PRESENTADO"
  | "PASO_1A"
  | "PASO_1B"
  | "PASO_1C"
  | "COMMIT_REACTIVO"
  | "AVANCE_ITEM"
  | "ETAPA_EVALUADA"
  | "FINALIZADO"
  | "ABANDONADO";

// Respuesta de los 3 pasos para un reactivo (unidad atomica de commit)
export interface ItemResponse {
  itemId: string;
  step1a: string; // texto libre
  step1b: string; // optionId elegido
  step1c: string; // optionId elegido (autorreporte)
  presentedOrder1b: string[]; // orden Fisher-Yates presentado
  startedAt: string;
  committedAt: string;
}

export interface Session {
  id: string;
  studentId: string;
  instrumentId: string;
  bank: Bank;
  state: FsmState;
  currentItemIndex: number;
  responses: ItemResponse[];
  online: boolean;
  syncPending: number;
  createdAt: string;
  updatedAt: string;
  finishedAt?: string;
}

export interface AuditEntry {
  seq: number;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
  syncEventId: string; // UNIQUE — idempotencia
  prevHash: string;
  hash: string; // SHA-256 chain hash
}
