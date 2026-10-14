"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, startSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

const MAX_FAILED = 5;

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "/";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function back(mode: "entrar" | "crear", next: string, error: string): never {
  redirect(`/login?modo=${mode}&next=${encodeURIComponent(next)}&error=${encodeURIComponent(error)}`);
}

function readForm(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    next: safeNext(formData.get("next")),
  };
}

export async function signUp(formData: FormData) {
  const { email, password, next } = readForm(formData);
  const username = String(formData.get("username") ?? "").replace(/\s+/g, " ").trim().slice(0, 24) || email.split("@")[0].slice(0, 24);
  if (!sql) back("crear", next, "Las cuentas no están disponibles todavía");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) back("crear", next, "Escribe un correo válido");
  if (password.length < 8 || password.length > 72) back("crear", next, "La contraseña debe tener entre 8 y 72 caracteres");

  const hash = await hashPassword(password);
  let rows: { id: string; username: string }[];
  try {
    rows = (await sql`
      with account as (insert into accounts (email, password_hash) values (${email}, ${hash}) returning id)
      insert into profiles (id, username) select id, ${username} from account
      returning id, username`) as { id: string; username: string }[];
  } catch (err) {
    if ((err as { code?: string }).code === "23505") back("crear", next, "Ese correo ya tiene cuenta. Entra con tu contraseña.");
    throw err;
  }
  await startSession({ id: rows[0].id, name: rows[0].username });
  revalidatePath("/", "layout");
  redirect(next);
}

export async function signIn(formData: FormData) {
  const { email, password, next } = readForm(formData);
  if (!sql) back("entrar", next, "Las cuentas no están disponibles todavía");

  const [account] = (await sql`
    select a.id, a.password_hash, a.locked_until > now() as locked, p.username
    from accounts a join profiles p on p.id = a.id
    where a.email = ${email}`) as { id: string; password_hash: string; locked: boolean | null; username: string }[];
  // ponytail: sin cuenta no se calcula ningún hash, así que el tiempo de respuesta revela si el correo existe (crear cuenta ya lo revela).
  if (account?.locked) back("entrar", next, "Demasiados intentos. Espera 15 minutos.");
  if (!account || !(await verifyPassword(password, account.password_hash))) {
    if (account) {
      await sql`
        update accounts set
          failed_logins = failed_logins + 1,
          locked_until = case when failed_logins + 1 >= ${MAX_FAILED} then now() + interval '15 minutes' else locked_until end
        where id = ${account.id}`;
    }
    back("entrar", next, "Correo o contraseña incorrectos");
  }

  await sql`update accounts set failed_logins = 0, locked_until = null where id = ${account.id}`;
  await startSession({ id: account.id, name: account.username });
  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut() {
  await endSession();
  revalidatePath("/", "layout");
  redirect("/");
}
