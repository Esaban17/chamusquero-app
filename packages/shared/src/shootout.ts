/** Reglas de la tanda de penales. Puras y deterministas (el azar entra por parámetro). */

export type Column = "L" | "C" | "R";
export type Height = "low" | "high";
export type Pick = { column: Column; height: Height };
export type Side = 0 | 1;
export type KickOutcome = "goal" | "saved" | "miss";

export type Kick = {
  side: Side;
  shot: Pick;
  dive: Pick;
  outcome: KickOutcome;
};

export const COLUMNS: Column[] = ["L", "C", "R"];
export const HEIGHTS: Height[] = ["high", "low"];

export const REGULATION_ROUNDS = 5;
/** Probabilidad de que un tiro alto se vaya por encima del travesaño. */
export const HIGH_MISS_CHANCE = 0.15;
/** Segundos que tiene cada jugador para elegir. */
export const PICK_SECONDS = 10;

export function isPick(value: unknown): value is Pick {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return COLUMNS.includes(v.column as Column) && HEIGHTS.includes(v.height as Height);
}

export function randomPick(random: () => number): Pick {
  return {
    column: COLUMNS[Math.floor(random() * COLUMNS.length)],
    height: HEIGHTS[Math.floor(random() * HEIGHTS.length)],
  };
}

/**
 * Resultado de un tiro:
 * - Un tiro alto puede irse afuera.
 * - El portero ataja si se tiró al mismo lado y a la misma altura.
 *   Si se quedó al centro, ataja cualquier tiro al centro.
 */
export function resolveKick(shot: Pick, dive: Pick, random: () => number): KickOutcome {
  if (shot.height === "high" && random() < HIGH_MISS_CHANCE) return "miss";
  if (dive.column === shot.column && (shot.column === "C" || dive.height === shot.height)) return "saved";
  return "goal";
}

/** El lado 0 tira primero; después se alternan. */
export function nextShooter(kicks: Kick[]): Side {
  return (kicks.length % 2) as Side;
}

export function score(kicks: Kick[]): [number, number] {
  const goals: [number, number] = [0, 0];
  for (const k of kicks) if (k.outcome === "goal") goals[k.side]++;
  return goals;
}

/** Devuelve el ganador si la tanda ya está decidida, o null si sigue. */
export function winner(kicks: Kick[]): Side | null {
  const [a, b] = score(kicks);
  const taken: [number, number] = [Math.ceil(kicks.length / 2), Math.floor(kicks.length / 2)];

  if (kicks.length < REGULATION_ROUNDS * 2) {
    const leftA = REGULATION_ROUNDS - taken[0];
    const leftB = REGULATION_ROUNDS - taken[1];
    if (a > b + leftB) return 0;
    if (b > a + leftA) return 1;
    return null;
  }

  // Muerte súbita: se decide al cerrar cada ronda.
  if (kicks.length % 2 === 0 && a !== b) return a > b ? 0 : 1;
  return null;
}
