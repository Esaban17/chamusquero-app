import type { HandshakeAuth } from "@penalitosgt/shared";
import { verifySession } from "@penalitosgt/shared/token";
import { config } from "./config.ts";

export type AuthUser = { id: string; name: string };

const clean = (name: string) => name.replace(/\s+/g, " ").trim().slice(0, 24);

/** Identifica al jugador con el token que firma la web, o como invitado si está permitido. */
export async function authenticate(auth: HandshakeAuth): Promise<AuthUser> {
  if (auth.token) {
    const session = verifySession(auth.token, "socket", config.authSecret);
    if (!session) throw new Error("Sesión inválida, vuelve a entrar");
    return { id: session.sub, name: clean(session.name) || "Jugador" };
  }

  if (config.allowGuests && auth.guestId && /^[a-zA-Z0-9-]{8,64}$/.test(auth.guestId)) {
    return { id: `guest:${auth.guestId}`, name: clean(auth.guestName ?? "") || "Invitado" };
  }

  throw new Error("Necesitas iniciar sesión para jugar");
}
