import { hashPassword, newToken } from "./auth";
import { appendAudit } from "./audit";
import { ITEMS, SEED_ADMIN, SEED_STUDENTS } from "./seed-data";
import type {
  AdminUser,
  AuditEntry,
  EvaluationWindow,
  Instrument,
  Item,
  Session,
  StudentToken,
} from "./types";

interface DB {
  items: Map<string, Item>;
  instruments: Map<string, Instrument>;
  admins: Map<string, AdminUser>;
  tokens: Map<string, StudentToken>;
  sessions: Map<string, Session>;
  window: EvaluationWindow;
  audit: AuditEntry[];
  seenSyncEvents: Set<string>;
}

// Almacen en memoria (POC). Singleton resistente a HMR de Next.
const globalForDb = globalThis as unknown as { __sedDb?: DB };

function seed(): DB {
  const items = new Map<string, Item>(ITEMS.map((i) => [i.id, i]));

  const instruments = new Map<string, Instrument>();
  const instA: Instrument = {
    id: "INST-A",
    name: "Instrumento Banco A — Plan 2022 NEM",
    bank: "A",
    itemIds: ITEMS.filter((i) => i.bank === "A").map((i) => i.id),
  };
  const instB: Instrument = {
    id: "INST-B",
    name: "Instrumento Banco B — MCCEMS 21/08/25",
    bank: "B",
    itemIds: ITEMS.filter((i) => i.bank === "B").map((i) => i.id),
  };
  instruments.set(instA.id, instA);
  instruments.set(instB.id, instB);

  const admins = new Map<string, AdminUser>();
  const admin: AdminUser = {
    id: "ADM-001",
    username: SEED_ADMIN.username,
    passwordHash: hashPassword(SEED_ADMIN.password),
    role: "ROLE_PILOT_ADMIN",
  };
  admins.set(admin.username, admin);

  const tokens = new Map<string, StudentToken>();
  for (const s of SEED_STUDENTS) {
    const token = newToken("EST");
    tokens.set(token, {
      token,
      studentId: s.id,
      instrumentId: s.instrumentBank === "A" ? "INST-A" : "INST-B",
      used: false,
      createdAt: new Date().toISOString(),
    });
  }

  const window: EvaluationWindow = {
    id: "WIN-001",
    opensAt: new Date(Date.now() - 86400000).toISOString(),
    closesAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    open: true,
  };

  const audit: AuditEntry[] = [];
  const seenSyncEvents = new Set<string>();
  appendAudit(audit, {
    actor: "SYSTEM",
    action: "SEED",
    detail: `items=${items.size} instrumentos=${instruments.size} tokens=${tokens.size}`,
    syncEventId: "seed-genesis",
  });

  return {
    items,
    instruments,
    admins,
    tokens,
    sessions: new Map(),
    window,
    audit,
    seenSyncEvents,
  };
}

export function db(): DB {
  if (!globalForDb.__sedDb) {
    globalForDb.__sedDb = seed();
  }
  return globalForDb.__sedDb;
}

// Idempotencia: registra un evento de sync una sola vez (sync_event_id UNIQUE)
export function recordSyncEvent(id: string): boolean {
  const d = db();
  if (d.seenSyncEvents.has(id)) return false;
  d.seenSyncEvents.add(id);
  return true;
}
