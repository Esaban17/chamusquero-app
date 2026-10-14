import type { DivisionId } from "./divisions.ts";

export type Team = {
  id: string;
  name: string;
  /** Abreviatura de 3 letras para el marcador. */
  short: string;
  division: DivisionId;
  /** Colores para el escudo genérico: [principal, secundario]. */
  colors: [string, string];
};

/**
 * Equipos reales del fútbol guatemalteco, temporada 2026-27.
 *
 * - Liga Nacional: los 12 del Torneo Apertura 2026.
 * - Primera División: los 20 del Apertura 2026 (grupos A y B).
 * - Segunda División: lista armada a partir de calendarios publicados; está POR VERIFICAR
 *   contra la lista oficial de la federación antes del lanzamiento.
 * - Tercera División: no hay una lista pública confiable, así que por ahora los rivales son
 *   combinados genéricos por departamento. POR REEMPLAZAR con los clubes reales.
 *
 * Los colores son aproximados y no se usan escudos oficiales (son marcas registradas).
 * Para actualizar equipos al cambiar de torneo, basta con editar este archivo.
 */
const team = (id: string, name: string, short: string, division: DivisionId, colors: [string, string]): Team => ({
  id,
  name,
  short,
  division,
  colors,
});

const LIGA_NACIONAL: Team[] = [
  team("municipal", "Municipal", "MUN", "liga-nacional", ["#C8102E", "#1D3E8A"]),
  team("comunicaciones", "Comunicaciones", "COM", "liga-nacional", ["#F4F1E8", "#111111"]),
  team("xelaju", "Xelajú MC", "XEL", "liga-nacional", ["#C8102E", "#1D3E8A"]),
  team("antigua", "Antigua GFC", "ANT", "liga-nacional", ["#1E7B3C", "#FFFFFF"]),
  team("coban-imperial", "Cobán Imperial", "COB", "liga-nacional", ["#5B2C83", "#FFFFFF"]),
  team("malacateco", "Malacateco", "MAL", "liga-nacional", ["#0F7A3E", "#FFFFFF"]),
  team("guastatoya", "Guastatoya", "GUA", "liga-nacional", ["#F2C200", "#1D3E8A"]),
  team("mixco", "Mixco", "MIX", "liga-nacional", ["#1D3E8A", "#C8102E"]),
  team("aurora", "Aurora FC", "AUR", "liga-nacional", ["#F2C200", "#111111"]),
  team("marquense", "Marquense", "MAR", "liga-nacional", ["#C8102E", "#111111"]),
  team("suchitepequez", "Suchitepéquez", "SUC", "liga-nacional", ["#C8102E", "#FFFFFF"]),
  team("san-pedro", "San Pedro", "SNP", "liga-nacional", ["#1D3E8A", "#FFFFFF"]),
];

const PRIMERA: [string, string, string][] = [
  ["huehuetecos", "Huehuetecos", "HUE"],
  ["aguacatan", "Aguacatán", "AGU"],
  ["copalera", "Copalera", "COP"],
  ["coatepeque", "Coatepeque", "COA"],
  ["santa-lucia", "Santa Lucía", "SLU"],
  ["gomerano", "Gomerano", "GOM"],
  ["iztapa", "Iztapa", "IZT"],
  ["quiche", "Quiché", "QUI"],
  ["chichicasteco", "Chichicasteco", "CHI"],
  ["amatitlan", "Amatitlán", "AMA"],
  ["nueva-santa-rosa", "Nueva Santa Rosa", "NSR"],
  ["sacachispas", "Sacachispas", "SAC"],
  ["mictlan", "Mictlán", "MIC"],
  ["sayaxche", "Sayaxché", "SAY"],
  ["fraijanes", "Fraijanes", "FRA"],
  ["san-benito", "San Benito", "SBE"],
  ["achuapa", "Achuapa", "ACH"],
  ["chiquimulilla", "Chiquimulilla", "CHQ"],
  ["aff-guate", "AFF Guate", "AFF"],
  ["champs-guate", "Champs Guate", "CHP"],
];

const SEGUNDA: [string, string, string][] = [
  ["atletico-cuilquense", "Atlético Cuilquense", "CUI"],
  ["barillas", "Barillas FC", "BAR"],
  ["boca-del-monte", "Boca del Monte", "BDM"],
  ["cabrican", "Cabricán FC", "CAB"],
  ["cabanes", "CD Cabañas", "CBN"],
  ["escuintla", "CD Escuintla", "ESC"],
  ["sansare", "CD Sansare", "SAN"],
  ["champs-academy-ii", "Champs Academy II", "CA2"],
  ["chimaltenango", "Chimaltenango FC", "CHM"],
  ["america-salcaja", "América Salcajá", "SAL"],
  ["juventud-teculuteca", "Juventud Teculuteca", "TEC"],
  ["jutiapa", "CSD Jutiapa", "JUT"],
  ["nueva-concepcion", "Nueva Concepción", "NCO"],
  ["san-cristobal", "San Cristóbal", "SCR"],
  ["cuilapa", "Cuilapa FC", "CLP"],
  ["ayutla", "Deportivo Ayutla", "AYU"],
  ["carcha", "Deportivo Carchá", "CAR"],
  ["catocha", "Deportivo Catocha", "CAT"],
  ["colomba", "Deportivo Colomba", "COL"],
  ["municipal-r19", "Municipal R19", "R19"],
  ["patulul", "Deportivo Patulul", "PAT"],
  ["san-sebastian", "Deportivo San Sebastián", "SSE"],
  ["sanarate", "Sanarate FC", "SNR"],
  ["tacana", "Deportivo Tacaná", "TAC"],
  ["ocos", "FC Ocós", "OCO"],
  ["flores", "Flores FC", "FLO"],
  ["izabal", "Izabal JC", "IZA"],
  ["jalapaneco", "Jalapaneco FC", "JAL"],
  ["juventud-cachacera", "Juventud Cachacera", "JCA"],
  ["monjas", "Monjas FC", "MON"],
  ["petapa", "Petapa", "PET"],
  ["poptun", "Poptún FC", "POP"],
  ["puerto-san-jose", "Puerto San José", "PSJ"],
  ["san-jose-del-golfo", "San José del Golfo", "SJG"],
  ["sija", "Sija FC", "SIJ"],
  ["tigres-del-jumay", "Tigres del Jumay", "TJU"],
  ["toros-de-taxisco", "Toros de Taxisco", "TAX"],
  ["usac", "Universidad de San Carlos", "USA"],
];

/** Paleta para equipos de ascenso mientras se verifican sus colores reales. */
const PALETTE: [string, string][] = [
  ["#C8102E", "#FFFFFF"],
  ["#1D3E8A", "#FFFFFF"],
  ["#1E7B3C", "#FFFFFF"],
  ["#F2C200", "#111111"],
  ["#5B2C83", "#FFFFFF"],
  ["#E46A11", "#111111"],
  ["#0E8C9B", "#FFFFFF"],
  ["#111111", "#F2C200"],
];

const lowerDivision = (rows: [string, string, string][], division: DivisionId) =>
  rows.map(([id, name, short], i) => team(id, name, short, division, PALETTE[i % PALETTE.length]));

// Marcadores de posición hasta tener la lista real de Tercera División.
const TERCERA: [string, string, string][] = [
  ["tercera-alta-verapaz", "Combinado Alta Verapaz", "AVE"],
  ["tercera-baja-verapaz", "Combinado Baja Verapaz", "BVE"],
  ["tercera-chimaltenango", "Combinado Chimaltenango", "CMT"],
  ["tercera-chiquimula", "Combinado Chiquimula", "CQM"],
  ["tercera-el-progreso", "Combinado El Progreso", "PRO"],
  ["tercera-escuintla", "Combinado Escuintla", "ESQ"],
  ["tercera-guatemala", "Combinado Guatemala", "GTM"],
  ["tercera-huehuetenango", "Combinado Huehuetenango", "HUH"],
  ["tercera-izabal", "Combinado Izabal", "IZB"],
  ["tercera-jalapa", "Combinado Jalapa", "JLP"],
  ["tercera-jutiapa", "Combinado Jutiapa", "JTP"],
  ["tercera-peten", "Combinado Petén", "PTN"],
  ["tercera-quetzaltenango", "Combinado Quetzaltenango", "QTZ"],
  ["tercera-quiche", "Combinado Quiché", "QCH"],
  ["tercera-retalhuleu", "Combinado Retalhuleu", "REU"],
  ["tercera-sacatepequez", "Combinado Sacatepéquez", "SCT"],
  ["tercera-san-marcos", "Combinado San Marcos", "SMA"],
  ["tercera-santa-rosa", "Combinado Santa Rosa", "SRO"],
  ["tercera-solola", "Combinado Sololá", "SOL"],
  ["tercera-suchitepequez", "Combinado Suchitepéquez", "SCH"],
  ["tercera-totonicapan", "Combinado Totonicapán", "TOT"],
  ["tercera-zacapa", "Combinado Zacapa", "ZAC"],
];

export const TEAMS: Team[] = [
  ...LIGA_NACIONAL,
  ...lowerDivision(PRIMERA, "primera"),
  ...lowerDivision(SEGUNDA, "segunda"),
  ...lowerDivision(TERCERA, "tercera"),
];

/** Equipos que se pueden elegir como favorito (los combinados genéricos no cuentan). */
export const SELECTABLE_TEAMS: Team[] = TEAMS.filter((t) => t.division !== "tercera");

const BY_ID = new Map(TEAMS.map((t) => [t.id, t]));

export function getTeam(id: string): Team | undefined {
  return BY_ID.get(id);
}

export function teamsInDivision(division: DivisionId): Team[] {
  return TEAMS.filter((t) => t.division === division);
}
