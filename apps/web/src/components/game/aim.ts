import { COLUMNS, HEIGHTS, type Pick } from "@chamusqueros/shared";

/** Geometría de la escena, en % del ancho (x) y del alto (y) de la cancha. */
export const GOAL = { left: 10, top: 8, width: 80, height: 44 };
export const SPOT = { x: 50, y: 84 };
/** Centro del portero parado en la línea de gol. */
export const KEEPER = { x: 50, y: GOAL.top + GOAL.height - 11 };

/**
 * Cuánto se amplifica el arrastre (las perillas para calibrar la sensibilidad).
 * Balón: con 2, subirlo ~6–27 % del alto de la cancha tira abajo y más de eso tira arriba.
 * Portero: con 1,5, moverlo ~9 % del ancho elige un lado y ~7 % hacia arriba se lanza alto.
 */
export const SWIPE_GAIN = 2;
export const DIVE_GAIN = 1.5;
/** Arrastre mínimo hacia arriba (en % del alto) para que cuente como tiro. */
const MIN_SWIPE = 6;
/** Arrastre mínimo del portero (en % de la cancha) para que cuente como estirada. */
const MIN_DIVE = 4;

/** Centro de una zona de la portería. */
export function zoneCenter({ column, height }: Pick) {
  return {
    x: GOAL.left + (GOAL.width * (COLUMNS.indexOf(column) + 0.5)) / COLUMNS.length,
    y: GOAL.top + (GOAL.height * (HEIGHTS.indexOf(height) + 0.5)) / HEIGHTS.length,
  };
}

/** Zona de la portería en un punto de la cancha; lo que cae fuera se ajusta a la zona más cercana. */
function zoneAt(x: number, y: number): Pick {
  const col = Math.floor((x - GOAL.left) / (GOAL.width / COLUMNS.length));
  return {
    column: COLUMNS[Math.min(COLUMNS.length - 1, Math.max(0, col))],
    height: y < GOAL.top + GOAL.height / 2 ? "high" : "low",
  };
}

/** Zona a la que va un tiro arrastrado desde el punto penal (dx, dy en % de la cancha). Null si es corto o hacia abajo. */
export function aimFromSwipe(dx: number, dy: number): Pick | null {
  if (dy > -MIN_SWIPE) return null;
  return zoneAt(SPOT.x + dx * SWIPE_GAIN, SPOT.y + dy * SWIPE_GAIN);
}

/** Zona a la que se lanza el portero arrastrado (dx, dy en % de la cancha). Null si apenas se movió. */
export function diveFromDrag(dx: number, dy: number): Pick | null {
  if (Math.hypot(dx, dy) < MIN_DIVE) return null;
  return zoneAt(KEEPER.x + dx * DIVE_GAIN, KEEPER.y + dy * DIVE_GAIN);
}
