import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { accountsEnabled, getSessionUser } from "@/lib/auth";
import { signIn, signUp } from "./actions";

export const metadata: Metadata = { title: "Entrar · penalitosGT" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; modo?: string; error?: string }>;
}) {
  const { next = "/jugar", modo, error } = await searchParams;
  if (await getSessionUser()) redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
  const creating = modo === "crear";
  const other = `/login?modo=${creating ? "entrar" : "crear"}&next=${encodeURIComponent(next)}`;

  if (!accountsEnabled) {
    return <p className="card mx-auto max-w-md text-muted">Las cuentas todavía no están disponibles. Puedes jugar como invitado.</p>;
  }

  return (
    <section className="card mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{creating ? "Crea tu cuenta" : "Entrar a penalitosGT"}</h1>
        <p className="text-muted">
          {creating ? "Con una cuenta tu equipo y tu progreso se guardan y apareces en la tabla de tu liga." : "Sigue donde te quedaste."}
        </p>
      </div>
      <form action={creating ? signUp : signIn} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        {creating && (
          <div>
            <label htmlFor="username" className="label">
              Apodo
            </label>
            <input id="username" name="username" maxLength={24} className="field" placeholder="El Goleador" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="label">
            Correo
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field" placeholder="tu@correo.com" />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete={creating ? "new-password" : "current-password"}
            className="field"
          />
          {creating && <p className="mt-1 text-xs text-muted">Mínimo 8 caracteres.</p>}
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button className="btn w-full">{creating ? "Crear cuenta y jugar" : "Entrar"}</button>
      </form>
      <p className="text-center text-sm text-muted">
        {creating ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
        <Link href={other} className="font-semibold text-pitch-strong hover:underline">
          {creating ? "Entra" : "Crea una"}
        </Link>
      </p>
    </section>
  );
}
