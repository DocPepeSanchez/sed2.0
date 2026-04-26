/**
 * Cifrado a nivel campo (ADR-10).
 *
 * AES-256-GCM con clave maestra desde KMS (en producción) o variable de
 * entorno (en desarrollo). Se aplica a campos PII de alta sensibilidad:
 * BAP, condición socioemocional, género declarado, MFA secret.
 *
 * Cumple P-05 (cifrado por defecto) e ISO/IEC 27018:2019.
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';

const ALG = 'aes-256-gcm';

function getKey(): Buffer {
  const raw = process.env.FIELD_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      'FIELD_ENCRYPTION_KEY no definida — los datos sensibles no pueden cifrarse (P-05).',
    );
  }
  // Derivamos 32 bytes deterministicamente; en producción se usa KMS HSM.
  return createHash('sha256').update(raw).digest();
}

/**
 * Cifra un valor JSON-serializable y devuelve un payload codificado base64
 * que contiene IV (12B) | tag (16B) | ciphertext.
 */
export function encryptField(plain: unknown): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALG, key, iv);
  const payload = JSON.stringify(plain);
  const enc = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptField<T = unknown>(blob: string | null | undefined): T | null {
  if (!blob) return null;
  const key = getKey();
  const buf = Buffer.from(blob, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  return JSON.parse(dec) as T;
}
