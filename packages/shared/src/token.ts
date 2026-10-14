import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Sesiones firmadas con HMAC-SHA256: `payload.firma`, ambos en base64url.
 * La web las usa en la cookie ("web") y para identificarse con el servidor de partidas ("socket").
 * Solo para el servidor: no se exporta desde index.ts para que node:crypto no llegue al navegador.
 */
export type Audience = "web" | "socket";
export type Session = { sub: string; name: string; aud: Audience; exp: number };

const mac = (body: string, secret: string) => createHmac("sha256", secret).update(body).digest("base64url");

export function signSession(user: { id: string; name: string }, aud: Audience, secret: string, ttlSeconds: number) {
  if (!secret) throw new Error("Falta AUTH_SECRET");
  const session: Session = { sub: user.id, name: user.name, aud, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${body}.${mac(body, secret)}`;
}

/** Devuelve la sesión si la firma es válida, es para `aud` y no ha vencido; si no, null. */
export function verifySession(token: string, aud: Audience, secret: string): Session | null {
  const [body, signature, extra] = token.split(".");
  if (!secret || !body || !signature || extra !== undefined) return null;
  const expected = Buffer.from(mac(body, secret));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const session = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    if (typeof session.sub !== "string" || typeof session.name !== "string") return null;
    if (session.aud !== aud || !(session.exp > Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}
