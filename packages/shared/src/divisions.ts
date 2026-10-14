export type DivisionId = "tercera" | "segunda" | "primera" | "liga-nacional";

export type Division = { id: DivisionId; name: string };

/** De abajo hacia arriba: se empieza en la primera y se asciende hacia la última. */
export const DIVISIONS: Division[] = [
  { id: "tercera", name: "Tercera División" },
  { id: "segunda", name: "Segunda División" },
  { id: "primera", name: "Primera División" },
  { id: "liga-nacional", name: "Liga Nacional" },
];

export const STARTING_DIVISION: DivisionId = "tercera";

/** Partidos por temporada y victorias necesarias para ascender (o ser campeón en Liga Nacional). */
export const SEASON_LENGTH = 5;
export const WINS_TO_PROMOTE = 3;
/** Con esta cantidad de derrotas en la temporada se desciende. */
export const LOSSES_TO_RELEGATE = 4;

export type Progress = {
  division: DivisionId;
  seasonWins: number;
  seasonLosses: number;
  titles: number;
};

export type ProgressEvent = "promoted" | "champion" | "relegated" | "new-season" | null;

export function divisionName(id: DivisionId): string {
  return DIVISIONS.find((d) => d.id === id)?.name ?? id;
}

export function newProgress(): Progress {
  return { division: STARTING_DIVISION, seasonWins: 0, seasonLosses: 0, titles: 0 };
}

const indexOf = (id: DivisionId) => DIVISIONS.findIndex((d) => d.id === id);

/**
 * Aplica el resultado de una tanda a la temporada del jugador.
 * - 3 victorias: asciende (en Liga Nacional, suma un título y empieza otra temporada).
 * - 4 derrotas: desciende (en la división más baja, solo reinicia la temporada).
 * - 5 partidos sin lo anterior: se queda y reinicia la temporada.
 */
export function applyResult(progress: Progress, won: boolean): { progress: Progress; event: ProgressEvent } {
  const wins = progress.seasonWins + (won ? 1 : 0);
  const losses = progress.seasonLosses + (won ? 0 : 1);
  const level = indexOf(progress.division);
  const fresh = { seasonWins: 0, seasonLosses: 0 };

  if (wins >= WINS_TO_PROMOTE) {
    if (level === DIVISIONS.length - 1) {
      return { progress: { ...progress, ...fresh, titles: progress.titles + 1 }, event: "champion" };
    }
    return { progress: { ...progress, ...fresh, division: DIVISIONS[level + 1].id }, event: "promoted" };
  }

  if (losses >= LOSSES_TO_RELEGATE) {
    if (level === 0) return { progress: { ...progress, ...fresh }, event: "new-season" };
    return { progress: { ...progress, ...fresh, division: DIVISIONS[level - 1].id }, event: "relegated" };
  }

  if (wins + losses >= SEASON_LENGTH) {
    return { progress: { ...progress, ...fresh }, event: "new-season" };
  }

  return { progress: { ...progress, seasonWins: wins, seasonLosses: losses }, event: null };
}
