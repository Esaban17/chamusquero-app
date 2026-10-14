import { COLUMNS, HEIGHTS, type Column, type Kick, type Pick, type Side } from "./shootout.ts";

/**
 * Bot sencillo: elige al azar pero con un poco de memoria.
 * Como portero tiende a tirarse hacia la columna que el rival más ha usado.
 */
export function botPick(role: "shooter" | "keeper", botSide: Side, kicks: Kick[], random: () => number): Pick {
  const height = HEIGHTS[Math.floor(random() * HEIGHTS.length)];

  if (role === "keeper") {
    const rivalShots = kicks.filter((k) => k.side !== botSide).map((k) => k.shot.column);
    if (rivalShots.length >= 2 && random() < 0.4) {
      const counts = new Map<Column, number>();
      for (const c of rivalShots) counts.set(c, (counts.get(c) ?? 0) + 1);
      const favorite = [...counts.entries()].sort((x, y) => y[1] - x[1])[0][0];
      return { column: favorite, height };
    }
  }

  // Los tiradores bot evitan un poco el centro.
  const weights = role === "shooter" ? [0.4, 0.2, 0.4] : [0.37, 0.26, 0.37];
  let r = random();
  for (let i = 0; i < COLUMNS.length; i++) {
    r -= weights[i];
    if (r < 0) return { column: COLUMNS[i], height };
  }
  return { column: "R", height };
}
