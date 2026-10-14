import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { signOut } from "@/app/login/actions";

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className="border-b border-line bg-card">
      <nav className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          ⚽ Chamusqueros
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/tabla" className="hover:underline">
            Tabla
          </Link>
          <Link href="/jugar" className="btn">
            Jugar
          </Link>
          {user ? (
            <form action={signOut} className="flex items-center gap-2">
              <span className="hidden font-semibold sm:inline">{user.name}</span>
              <button className="text-muted hover:underline">Salir</button>
            </form>
          ) : (
            <Link href="/login" className="hover:underline">
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
