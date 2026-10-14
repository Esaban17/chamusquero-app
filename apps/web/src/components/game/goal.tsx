"use client";

import { COLUMNS, HEIGHTS, type Kick, type Pick } from "@chamusqueros/shared";

const OUTCOME_TEXT = { goal: "¡GOOOL!", saved: "¡Atajada!", miss: "¡Afuera!" } as const;

/**
 * Portería dividida en 6 zonas (3 columnas × 2 alturas).
 * El jugador hace clic en la zona donde tira o hacia donde se lanza.
 */
export function Goal({
  role,
  selected,
  disabled,
  reveal,
  onPick,
}: {
  role: "shooter" | "keeper";
  selected: Pick | null;
  disabled: boolean;
  reveal: Kick | null;
  onPick: (pick: Pick) => void;
}) {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="rounded-t-md border-x-8 border-t-8 border-white bg-[repeating-linear-gradient(45deg,rgba(255,255,255,.08)_0_2px,transparent_2px_14px),repeating-linear-gradient(-45deg,rgba(255,255,255,.08)_0_2px,transparent_2px_14px)] bg-pitch-strong/80 p-2 shadow-lg">
        <div className="grid grid-cols-3 grid-rows-2 gap-2">
          {HEIGHTS.map((height) =>
            COLUMNS.map((column) => {
              const isSelected = selected?.column === column && selected.height === height;
              const isShot = reveal?.shot.column === column && reveal.shot.height === height;
              const isDive =
                reveal &&
                reveal.dive.column === column &&
                (reveal.dive.height === height || (column === "C" && reveal.shot.column === "C"));
              return (
                <button
                  key={`${column}-${height}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPick({ column, height })}
                  aria-label={`${role === "shooter" ? "Tirar" : "Lanzarse"} ${label(column, height)}`}
                  className={`relative flex aspect-[4/3] items-center justify-center rounded-md border-2 text-2xl transition ${
                    isSelected ? "border-accent bg-accent/30" : "border-white/25 hover:border-white/70 hover:bg-white/10"
                  } disabled:cursor-default disabled:hover:border-white/25 disabled:hover:bg-transparent`}
                >
                  {isDive && <span aria-hidden>🧤</span>}
                  {isShot && <span aria-hidden className={reveal?.outcome === "miss" ? "-translate-y-8 opacity-60" : ""}>⚽</span>}
                </button>
              );
            }),
          )}
        </div>
      </div>
      <div className="h-6 rounded-b-md bg-pitch" />
      {reveal && (
        <p
          className={`absolute inset-x-0 top-1/3 text-center text-5xl font-black drop-shadow-lg ${
            reveal.outcome === "goal" ? "text-accent" : "text-white"
          }`}
        >
          {OUTCOME_TEXT[reveal.outcome]}
        </p>
      )}
    </div>
  );
}

function label(column: string, height: string) {
  const side = { L: "a la izquierda", C: "al centro", R: "a la derecha" }[column];
  return `${side}, ${height === "high" ? "arriba" : "abajo"}`;
}
