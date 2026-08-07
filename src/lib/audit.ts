import { createHash } from "node:crypto";
import type { AuditEntry } from "./types";

const GENESIS = "0".repeat(64);

function sha256(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

// Auditoria append-only con encadenamiento de hash SHA-256
export function appendAudit(
  log: AuditEntry[],
  params: {
    actor: string;
    action: string;
    detail: string;
    syncEventId: string;
  },
): AuditEntry {
  const prevHash = log.length ? log[log.length - 1].hash : GENESIS;
  const seq = log.length + 1;
  const timestamp = new Date().toISOString();
  const payload = `${seq}|${timestamp}|${params.actor}|${params.action}|${params.detail}|${params.syncEventId}|${prevHash}`;
  const hash = sha256(payload);
  const entry: AuditEntry = {
    seq,
    timestamp,
    actor: params.actor,
    action: params.action,
    detail: params.detail,
    syncEventId: params.syncEventId,
    prevHash,
    hash,
  };
  log.push(entry);
  return entry;
}

// Verifica la integridad de la cadena de auditoria
export function verifyChain(log: AuditEntry[]): boolean {
  let prevHash = GENESIS;
  for (const e of log) {
    const payload = `${e.seq}|${e.timestamp}|${e.actor}|${e.action}|${e.detail}|${e.syncEventId}|${prevHash}`;
    if (sha256(payload) !== e.hash) return false;
    if (e.prevHash !== prevHash) return false;
    prevHash = e.hash;
  }
  return true;
}
