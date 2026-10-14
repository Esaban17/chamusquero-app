import { createClient } from "@supabase/supabase-js";
import type { HandshakeAuth } from "@chamusqueros/shared";
import { config } from "./config.ts";

export type AuthUser = { id: string; name: string };

const authClient =
  config.supabaseUrl && config.supabasePublishableKey
    ? createClient(config.supabaseUrl, config.supabasePublishableKey, { auth: { persistSession: false } })
    : null;

const clean = (name: string) => name.replace(/\s+/g, " ").trim().slice(0, 24);

/** Identifica al jugador con su token de Supabase, o como invitado si está permitido. */
export async function authenticate(auth: HandshakeAuth): Promise<AuthUser> {
  if (auth.token && authClient) {
    const { data, error } = await authClient.auth.getUser(auth.token);
    if (error || !data.user) throw new Error("Sesión inválida, vuelve a entrar");
    const meta = data.user.user_metadata as { username?: string } | undefined;
    return { id: data.user.id, name: clean(meta?.username ?? data.user.email?.split("@")[0] ?? "Jugador") };
  }

  if (config.allowGuests && auth.guestId && /^[a-zA-Z0-9-]{8,64}$/.test(auth.guestId)) {
    return { id: `guest:${auth.guestId}`, name: clean(auth.guestName ?? "") || "Invitado" };
  }

  throw new Error("Necesitas iniciar sesión para jugar");
}
