import { cookies } from "next/headers";
import { signSession, verifySession } from "@penalitosgt/shared/token";

export type SessionUser = { id: string; name: string };

const COOKIE = "penalitosgt_session";
const MONTH = 60 * 60 * 24 * 30;
const secret = () => process.env.AUTH_SECRET ?? "";

/** Hay cuentas si existen la base de datos y el secreto para firmar sesiones. */
export const accountsEnabled = Boolean(process.env.DATABASE_URL && process.env.AUTH_SECRET);

/** Usuario con sesión (cookie firmada), o null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  const session = token ? verifySession(token, "web", secret()) : null;
  return session ? { id: session.sub, name: session.name } : null;
}

export async function startSession(user: SessionUser) {
  (await cookies()).set(COOKIE, signSession(user, "web", secret(), MONTH), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MONTH,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** Token corto con el que el navegador se identifica ante el servidor de partidas (la cookie es httpOnly). */
export function socketToken(user: SessionUser) {
  return signSession(user, "socket", secret(), 60 * 60 * 12);
}
