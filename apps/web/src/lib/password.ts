import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/** Contraseñas con scrypt (stdlib de Node): sal aleatoria por usuario y comparación en tiempo constante. */
const N = 16384;
const KEYLEN = 64;

const derive = (password: string, salt: Buffer, keylen: number, cost: number) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, keylen, { N: cost }, (err, key) => (err ? reject(err) : resolve(key))),
  );

/** Formato guardado: `scrypt$N$sal$hash` (base64url). */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await derive(password, salt, KEYLEN, N);
  return `scrypt$${N}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, cost, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !cost || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = await derive(password, Buffer.from(salt, "base64url"), expected.length, Number(cost));
  return timingSafeEqual(actual, expected);
}
