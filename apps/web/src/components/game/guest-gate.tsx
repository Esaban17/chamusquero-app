"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Game } from "./game";
import type { Identity } from "./use-game";

const KEY = "chamusqueros:guest";

const readStored = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const noSubscribe = () => () => {};

/** Modo invitado: pide un apodo y juega sin cuenta (el progreso no se guarda al reiniciar el servidor). */
export function GuestGate() {
  // Se lee después de hidratar (en el servidor no hay localStorage).
  const stored = useSyncExternalStore(noSubscribe, readStored, () => null);
  const storedIdentity = useMemo(() => {
    try {
      return stored ? (JSON.parse(stored) as Identity) : null;
    } catch {
      return null;
    }
  }, [stored]);
  const [created, setIdentity] = useState<Identity | null>(null);
  const identity = created ?? storedIdentity;
  const [name, setName] = useState("");

  if (identity) {
    return (
      <>
        <p className="mb-4 rounded-lg bg-accent/20 px-4 py-2 text-sm">
          Juegas como invitado: tu progreso no se guarda.{" "}
          <Link href="/login?modo=crear&next=/jugar" className="font-semibold underline">
            Crea una cuenta
          </Link>{" "}
          o{" "}
          <Link href="/login?next=/jugar" className="font-semibold underline">
            entra
          </Link>
          .
        </p>
        <Game identity={identity} />
      </>
    );
  }

  return (
    <form
      className="card mx-auto max-w-md space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const guest: Identity = { kind: "guest", guestId: crypto.randomUUID(), guestName: name.trim() || "Invitado" };
        try {
          localStorage.setItem(KEY, JSON.stringify(guest));
        } catch {}
        setIdentity(guest);
      }}
    >
      <h1 className="text-xl font-bold">Jugar como invitado</h1>
      <div>
        <label htmlFor="guest-name" className="label">
          Tu apodo
        </label>
        <input
          id="guest-name"
          className="field"
          maxLength={24}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="El Chamusquero"
        />
      </div>
      <button className="btn w-full">Entrar a la cancha</button>
      <p className="text-center text-sm text-muted">
        ¿Quieres guardar tu progreso?{" "}
        <Link href="/login?modo=crear&next=/jugar" className="font-semibold text-pitch-strong hover:underline">
          Crea una cuenta
        </Link>{" "}
        ·{" "}
        <Link href="/login?next=/jugar" className="font-semibold text-pitch-strong hover:underline">
          Ya tengo cuenta
        </Link>
      </p>
    </form>
  );
}
