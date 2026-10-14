import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { getTeam, newProgress, type DivisionId, type Progress } from "@penalitosgt/shared";
import { config, hasDatabase } from "./config.ts";

export type PlayerRecord = {
  id: string;
  name: string;
  teamId: string | null;
  progress: Progress;
};

export type MatchRecord = {
  division: DivisionId;
  players: [string | null, string | null];
  teams: [string, string];
  score: [number, number];
  winner: 0 | 1;
  reason: "shootout" | "forfeit";
};

export interface Store {
  getPlayer(id: string, fallbackName: string): Promise<PlayerRecord>;
  setTeam(id: string, teamId: string): Promise<void>;
  saveProgress(id: string, progress: Progress, won: boolean): Promise<void>;
  recordMatch(match: MatchRecord): Promise<void>;
}

/** Guarda todo en memoria: para desarrollo y para invitados. Se pierde al reiniciar. */
export class MemoryStore implements Store {
  private players = new Map<string, PlayerRecord>();

  async getPlayer(id: string, fallbackName: string) {
    let player = this.players.get(id);
    if (!player) {
      player = { id, name: fallbackName, teamId: null, progress: newProgress() };
      this.players.set(id, player);
    }
    return structuredClone(player);
  }

  async setTeam(id: string, teamId: string) {
    const player = this.players.get(id);
    if (player) player.teamId = teamId;
  }

  async saveProgress(id: string, progress: Progress) {
    const player = this.players.get(id);
    if (player) player.progress = progress;
  }

  async recordMatch() {}
}

type ProfileRow = {
  id: string;
  username: string;
  favorite_team_id: string | null;
  division: DivisionId;
  season_wins: number;
  season_losses: number;
  titles: number;
  wins: number;
  losses: number;
};

/** Persiste en Postgres (Neon). Solo el servidor de partidas escribe el progreso. */
export class PostgresStore implements Store {
  private sql: NeonQueryFunction<false, false>;

  constructor(sql: NeonQueryFunction<false, false>) {
    this.sql = sql;
  }

  async getPlayer(id: string, fallbackName: string): Promise<PlayerRecord> {
    // El perfil se crea al registrarse; si faltara, se crea aquí (la cuenta debe existir).
    let [row] = (await this.sql`select * from profiles where id = ${id}`) as ProfileRow[];
    row ??= ((await this.sql`
      insert into profiles (id, username) values (${id}, ${fallbackName})
      on conflict (id) do update set username = profiles.username
      returning *`) as ProfileRow[])[0];

    return {
      id: row.id,
      name: row.username,
      teamId: row.favorite_team_id && getTeam(row.favorite_team_id) ? row.favorite_team_id : null,
      progress: {
        division: row.division,
        seasonWins: row.season_wins,
        seasonLosses: row.season_losses,
        titles: row.titles,
      },
    };
  }

  async setTeam(id: string, teamId: string) {
    await this.sql`update profiles set favorite_team_id = ${teamId}, updated_at = now() where id = ${id}`;
  }

  async saveProgress(id: string, progress: Progress, won: boolean) {
    await this.sql`
      update profiles set
        division = ${progress.division},
        season_wins = ${progress.seasonWins},
        season_losses = ${progress.seasonLosses},
        titles = ${progress.titles},
        wins = wins + ${won ? 1 : 0},
        losses = losses + ${won ? 0 : 1},
        updated_at = now()
      where id = ${id}`;
  }

  async recordMatch(m: MatchRecord) {
    await this.sql`
      insert into matches (division, player_a, player_b, team_a, team_b, score_a, score_b, winner, reason)
      values (${m.division}, ${m.players[0]}, ${m.players[1]}, ${m.teams[0]}, ${m.teams[1]},
              ${m.score[0]}, ${m.score[1]}, ${m.winner}, ${m.reason})`;
  }
}

export const memoryStore = new MemoryStore();

const persistent: Store = hasDatabase ? new PostgresStore(neon(config.databaseUrl)) : memoryStore;

/** Los invitados siempre van a memoria; las cuentas, a Postgres si está configurado. */
export function storeFor(userId: string): Store {
  return userId.startsWith("guest:") ? memoryStore : persistent;
}
