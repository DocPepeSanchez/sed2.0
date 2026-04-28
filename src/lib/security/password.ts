/**
 * Hashing de contraseñas — bcrypt (compatible OWASP, sin módulos nativos).
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
    if (plain.length < 12) throw new Error('La contraseña debe tener al menos 12 caracteres.');
    return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
    try {
          return await bcrypt.compare(plain, hash);
    } catch {
          return false;
    }
}
