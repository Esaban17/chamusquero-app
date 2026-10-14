"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { COLUMNS, HEIGHTS, type Kick, type Pick } from "@chamusqueros/shared";
import { GOAL, KEEPER, SPOT, aimFromSwipe, diveFromDrag, zoneCenter } from "./aim";
import { playKick } from "./sound";

const OUTCOME_TEXT = { goal: "¡GOOOL!", saved: "¡Atajada!", miss: "¡Afuera!" } as const;
/** Duración del vuelo del balón y la estirada del portero (el servidor muestra cada tiro 2,5 s). */
const FLIGHT_MS = 450;

type Drag = { dx: number; dy: number; aim: Pick | null };

/**
 * Cancha con portería de 6 zonas (3 columnas × 2 alturas), punto penal y portero.
 * En tu turno arrastras desde cualquier parte de la cancha: el tirador lanza el balón y el portero se lanza él.
 * Las zonas son botones invisibles para teclado y lector de pantalla.
 * Balón y portero solo se mueven cuando el servidor revela el tiro: las elecciones son a ciegas.
 */
export function Goal({
  role,
  selected,
  disabled,
  reveal,
  keeperColors,
  onPick,
}: {
  role: "shooter" | "keeper";
  selected: Pick | null;
  disabled: boolean;
  reveal: Kick | null;
  keeperColors: [string, string];
  onPick: (pick: Pick) => void;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const marked = drag?.aim ?? selected;

  useEffect(() => {
    if (!reveal) return;
    const t = setTimeout(() => playKick(reveal.outcome), FLIGHT_MS);
    return () => clearTimeout(t);
  }, [reveal]);

  /** Arrastre desde donde se presionó, y la zona a la que apunta según quién tira o ataja. */
  const measure = (e: PointerEvent): Drag | null => {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!start.current || !rect) return null;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const [fx, fy] = [(dx / rect.width) * 100, (dy / rect.height) * 100];
    return { dx, dy, aim: role === "shooter" ? aimFromSwipe(fx, fy) : diveFromDrag(fx, fy) };
  };
  const endDrag = () => {
    start.current = null;
    setDrag(null);
  };

  // Las transiciones solo se aplican al revelar: al empezar el siguiente turno, balón y portero vuelven de golpe.
  const flying = reveal ? "transition-all ease-out" : "";
  const duration = reveal ? `${FLIGHT_MS}ms` : undefined;
  const ball = reveal
    ? { ...zoneCenter(reveal.shot), ...(reveal.outcome === "miss" && { y: GOAL.top - 6 }) }
    : SPOT;
  const keeper = reveal ? diveTo(reveal.dive) : { ...KEEPER, rotate: 0 };
  const ballDrag = role === "shooter" && drag ? drag : null;
  const keeperDrag = role === "keeper" && drag ? drag : null;

  return (
    <div
      ref={sceneRef}
      className={`relative mx-auto aspect-[6/5] w-full max-w-[min(36rem,72svh)] select-none overflow-hidden rounded-xl bg-pitch-strong bg-[repeating-linear-gradient(180deg,rgba(255,255,255,.07)_0_10%,transparent_10%_20%)] shadow-lg ${
        disabled ? "" : `touch-none ${drag ? "cursor-grabbing" : "cursor-grab"}`
      }`}
      onPointerDown={(e) => {
        if (disabled) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        start.current = { x: e.clientX, y: e.clientY };
        setDrag({ dx: 0, dy: 0, aim: null });
      }}
      onPointerMove={(e) => {
        const next = measure(e);
        if (next) setDrag(next);
      }}
      onPointerUp={(e) => {
        const aim = measure(e)?.aim;
        endDrag();
        if (aim && !disabled) onPick(aim);
      }}
      onPointerCancel={endDrag}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Línea de gol, área chica y punto penal */}
      <div className="absolute inset-x-0 h-0.5 bg-white/80" style={{ top: `${GOAL.top + GOAL.height}%` }} />
      <div
        className="absolute border-2 border-t-0 border-white/80"
        style={{ left: "25%", width: "50%", top: `${GOAL.top + GOAL.height}%`, height: "14%" }}
      />
      <div
        className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        style={{ left: `${SPOT.x}%`, top: `${SPOT.y}%` }}
      />

      {/* Portería. Las zonas no se ven: solo sirven para jugar con teclado o lector de pantalla. */}
      <div
        className="absolute rounded-t-md border-x-8 border-t-8 border-white bg-[repeating-linear-gradient(45deg,rgba(255,255,255,.12)_0_2px,transparent_2px_14px),repeating-linear-gradient(-45deg,rgba(255,255,255,.12)_0_2px,transparent_2px_14px)] p-1.5"
        style={{ left: `${GOAL.left}%`, top: `${GOAL.top}%`, width: `${GOAL.width}%`, height: `${GOAL.height}%` }}
      >
        <div className="grid h-full grid-cols-3 grid-rows-2 gap-1.5">
          {HEIGHTS.map((height) =>
            COLUMNS.map((column) => (
              <button
                key={`${column}-${height}`}
                type="button"
                disabled={disabled}
                onClick={() => onPick({ column, height })}
                aria-label={`${role === "shooter" ? "Tirar" : "Lanzarse"} ${label(column, height)}`}
                aria-pressed={marked?.column === column && marked.height === height}
                className="pointer-events-none rounded-md outline-none focus-visible:ring-4 focus-visible:ring-accent"
              />
            )),
          )}
        </div>
      </div>

      {/* Mira: a dónde apuntas mientras arrastras y lo que elegiste mientras esperas al rival */}
      {marked && !reveal && (
        <div
          data-target
          className="pointer-events-none absolute flex aspect-square w-[11%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-accent bg-accent/20"
          style={{ left: `${zoneCenter(marked).x}%`, top: `${zoneCenter(marked).y}%` }}
        >
          <span className="h-2 w-2 rounded-full bg-accent" />
        </div>
      )}

      {/* Portero: se mueve en la línea mientras espera y se estira al revelar el tiro */}
      <div
        data-keeper
        className={`pointer-events-none absolute w-[14%] ${flying}`}
        style={{
          left: `${keeper.x}%`,
          top: `${keeper.y}%`,
          transform: `translate(calc(-50% + ${keeperDrag?.dx ?? 0}px), calc(-50% + ${keeperDrag?.dy ?? 0}px)) rotate(${keeper.rotate}deg)`,
          transitionDuration: duration,
        }}
      >
        <div className={reveal || keeperDrag ? "" : "motion-safe:animate-keeper"}>
          <Keeper colors={keeperColors} />
        </div>
      </div>

      {/* Balón en el punto penal */}
      <div
        data-ball
        className={`pointer-events-none absolute w-[8%] ${flying} ${reveal?.outcome === "miss" ? "opacity-50" : ""}`}
        style={{
          left: `${ball.x}%`,
          top: `${ball.y}%`,
          transform: `translate(calc(-50% + ${ballDrag?.dx ?? 0}px), calc(-50% + ${ballDrag?.dy ?? 0}px)) scale(${reveal ? 0.65 : 1})`,
          transitionDuration: duration,
        }}
      >
        <Ball />
      </div>

      {reveal && (
        <p
          className={`pointer-events-none absolute inset-x-0 top-[58%] text-center text-5xl font-black drop-shadow-lg ${
            reveal.outcome === "goal" ? "text-accent" : "text-white"
          }`}
        >
          {OUTCOME_TEXT[reveal.outcome]}
        </p>
      )}
    </div>
  );
}

/** Hacia dónde se estira el portero. Al centro no salta: ahí ataja cualquier altura. */
function diveTo(dive: Pick) {
  const { x, y } = zoneCenter(dive);
  if (dive.column === "C") return { ...KEEPER, rotate: 0 };
  const angle = dive.height === "high" ? 60 : 90;
  return { x, y, rotate: dive.column === "L" ? -angle : angle };
}

function Keeper({ colors: [shirt, trim] }: { colors: [string, string] }) {
  return (
    <svg viewBox="0 0 60 80" className="block h-auto w-full drop-shadow" aria-hidden>
      <path d="M19 30 L7 15 M41 30 L53 15" stroke={shirt} strokeWidth="7" strokeLinecap="round" />
      <circle cx="6" cy="12" r="5.5" fill="#fff" stroke="#222" strokeWidth="1.2" />
      <circle cx="54" cy="12" r="5.5" fill="#fff" stroke="#222" strokeWidth="1.2" />
      <path d="M24 56 L22 73 M36 56 L38 73" stroke="#222" strokeWidth="6" strokeLinecap="round" />
      <path d="M17 76 h8 M35 76 h8" stroke="#111" strokeWidth="4" strokeLinecap="round" />
      <rect x="17" y="23" width="26" height="26" rx="6" fill={shirt} stroke={trim} strokeWidth="2.5" />
      <rect x="19" y="47" width="22" height="10" rx="2" fill={trim} />
      <circle cx="30" cy="14" r="8" fill="#c68a5a" />
    </svg>
  );
}

function Ball() {
  return (
    <svg viewBox="0 0 20 20" className="block h-auto w-full drop-shadow" aria-hidden>
      <circle cx="10" cy="10" r="9.3" fill="#fff" stroke="#222" strokeWidth="0.8" />
      <path d="M10 6.2 13.6 8.8 12.2 13 7.8 13 6.4 8.8Z" fill="#222" />
      <path d="M10 0.8V6.2M13.6 8.8 18.6 7M12.2 13l2.8 4.4M7.8 13 5 17.4M6.4 8.8 1.4 7" stroke="#222" strokeWidth="0.8" />
    </svg>
  );
}

function label(column: string, height: string) {
  const side = { L: "a la izquierda", C: "al centro", R: "a la derecha" }[column];
  return `${side}, ${height === "high" ? "arriba" : "abajo"}`;
}
