/**
 * Hashing de contraseñas — argon2id (recomendación OWASP 2024).
 */

import argon2 from 'argon2';

const HASH_OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 64 * 1024,
  timeCost: 3,
  parallelism: 4,
};

export async function hashPassword(plain: string): Promise<string> {
  if (plain.length < 12) throw new Error('La contraseña debe tener al menos 12 caracteres.');
  return argon2.hash(plain, HASH_OPTS);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}
