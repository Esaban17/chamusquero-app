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
 * - Tercera División: los 59 del Apertura 2026 (10 grupos).
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

// Torneo Apertura 2026, 10 grupos (tabla de la jornada 14 publicada por Antorcha Deportiva).
const TERCERA: [string, string, string][] = [
  ["atletico-tumbadorense", "Atlético Tumbadorense", "TUM"],
  ["jacaltenango", "Jacaltenango FC", "JAC"],
  ["nuevo-horizonte", "CD Nuevo Horizonte", "NHO"],
  ["sibinal", "Sibinal FC", "SIB"],
  ["deportivo-mulua", "Deportivo Mulúa FC", "MUL"],
  ["juventud-tiquisatense", "Juventud Tiquisatense", "TIQ"],
  ["la-maquina", "CF La Máquina", "MAQ"],
  ["juventud-tiburoneros", "CF Juventud Tiburoneros", "TIB"],
  ["tigres-nueva-era", "Tigres AFC Nueva Era", "NER"],
  ["batallon-canales", "Batallón Canales", "BCA"],
  ["santa-catarina-pinula", "Santa Catarina Pinula", "SCP"],
  ["futeca", "Futeca FC", "FUT"],
  ["global-soccer-academy", "Global Soccer Academy", "GSA"],
  ["juventus-academy", "Juventus Academy Guatemala", "JAG"],
  ["cantera-bt", "CF Cantera BT", "CBT"],
  ["aff-guatemala-b", "AFF Guatemala B", "AFB"],
  ["barcenas", "FC Bárcenas", "BRC"],
  ["draco", "Draco FC", "DRA"],
  ["fundacion-bi", "Fundación BI", "FBI"],
  ["villa-nueva", "CFS Deportivo Villa Nueva", "VNU"],
  ["iron-sport", "CSD Iron Sport", "IRO"],
  ["as-club", "AS Club", "ASC"],
  ["ciudad-del-sol", "CD Ciudad del Sol", "CDS"],
  ["acatenango", "Acatenango FC", "ACA"],
  ["jocotenango", "Deportivo Jocotenango", "JOC"],
  ["el-tejar", "CF El Tejar", "TEJ"],
  ["san-lucas-sacatepequez", "ADM San Lucas Sac.", "SLS"],
  ["yepocapa", "Deportivo Yepocapa", "YEP"],
  ["chimaltenango-b", "Chimaltenango FC B", "CHB"],
  ["ud-asuncion", "CF UD Asunción", "ASU"],
  ["santa-luisa-chinautla", "CF Santa Luisa Chinautla", "CHN"],
  ["estudiantes-guatemala", "Estudiantes Guatemala FC", "EST"],
  ["mixco-b", "Mixco B", "MXB"],
  ["ayampuc", "CF Ayampuc", "AYA"],
  ["sanjuaneros", "CSD Sanjuaneros", "SJN"],
  ["champs-ag", "CF Champ's AG", "CAG"],
  ["usac-tercera", "Club de Fútbol USAC", "USC"],
  ["imark-sr", "FC Imar'k SR", "IMK"],
  ["oratoriense", "CF Oratoriense", "ORA"],
  ["cerinal", "CD Cerinal FC", "CER"],
  ["jalpatagua", "Jalpatagua FC", "JPG"],
  ["san-pedro-pinula", "San Pedro Pinula FC", "SPP"],
  ["remicheros", "Remicheros FC", "REM"],
  ["rio-hondo", "Río Hondo Emfut", "RHO"],
  ["santa-cruz-nz", "CF Santa Cruz NZ", "SCZ"],
  ["san-esteban", "CSD San Esteban", "SES"],
  ["atlas-esquipulas", "CSD Atlas Esquipulas", "ATL"],
  ["los-cabros-usumatlan", "CF Los Cabros Usumatlán", "USU"],
  ["real-amatense", "CFD Real Amatense", "RAM"],
  ["quirigua", "Deportivo Quiriguá", "QRG"],
  ["rio-dulce", "CSD Río Dulce", "RDU"],
  ["el-naranjo", "CSD El Naranjo", "NAR"],
  ["fray", "Fray FC", "FRY"],
  ["salama", "CF Salamá", "SLM"],
  ["torino-salama", "CDF Torino Salamá", "TOR"],
  ["lanquin", "Lanquín United", "LAN"],
  ["real-chamelco", "CD Real Chamelco", "RCH"],
  ["danny-soccer-carcha", "Danny Soccer Carchá AV", "DSC"],
  ["santa-cruz-av", "Deportivo Santa Cruz AV", "SCV"],
];

export const TEAMS: Team[] = [
  ...LIGA_NACIONAL,
  ...lowerDivision(PRIMERA, "primera"),
  ...lowerDivision(SEGUNDA, "segunda"),
  ...lowerDivision(TERCERA, "tercera"),
];

/** Equipos que se pueden elegir como favorito. */
export const SELECTABLE_TEAMS: Team[] = TEAMS;

const BY_ID = new Map(TEAMS.map((t) => [t.id, t]));

export function getTeam(id: string): Team | undefined {
  return BY_ID.get(id);
}

export function teamsInDivision(division: DivisionId): Team[] {
  return TEAMS.filter((t) => t.division === division);
}
