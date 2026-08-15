import { randomBytes } from 'crypto';

/** Génère un ID court aléatoire type cuid-like */
export function nanoid(size = 12): string {
  return randomBytes(size).toString('base64url').slice(0, size);
}
