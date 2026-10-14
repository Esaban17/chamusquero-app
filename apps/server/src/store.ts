import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getTeam, newProgress, type DivisionId, type Progress } from "@chamusqueros/shared";
import { config, hasSupabase } from "./config.ts";

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

/** Persiste en Supabase con la clave secreta (salta RLS: solo el servidor escribe). */
export class SupabaseStore implements Store {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async getPlayer(id: string, fallbackName: string): Promise<PlayerRecord> {
    const { data, error } = await this.db.from("profiles").select("*").eq("id", id).maybeSingle<ProfileRow>();
    if (error) throw new Error(error.message);

    let row = data;
    if (!row) {
      const { data: created, error: insertError } = await this.db
        .from("profiles")
        .upsert({ id, username: fallbackName })
        .select("*")
        .single<ProfileRow>();
      if (insertError) throw new Error(insertError.message);
      row = created;
    }

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
    const { error } = await this.db.from("profiles").update({ favorite_team_id: teamId }).eq("id", id);
    if (error) throw new Error(error.message);
  }

  async saveProgress(id: string, progress: Progress, won: boolean) {
    const { error } = await this.db.rpc("save_progress", {
      p_user_id: id,
      p_division: progress.division,
      p_season_wins: progress.seasonWins,
      p_season_losses: progress.seasonLosses,
      p_titles: progress.titles,
      p_won: won,
    });
    if (error) throw new Error(error.message);
  }

  async recordMatch(m: MatchRecord) {
    const { error } = await this.db.from("matches").insert({
      division: m.division,
      player_a: m.players[0],
      player_b: m.players[1],
      team_a: m.teams[0],
      team_b: m.teams[1],
      score_a: m.score[0],
      score_b: m.score[1],
      winner: m.winner,
      reason: m.reason,
    });
    if (error) throw new Error(error.message);
  }
}

export const memoryStore = new MemoryStore();

export const supabaseAdmin = hasSupabase
  ? createClient(config.supabaseUrl, config.supabaseSecretKey, { auth: { persistSession: false } })
  : null;

const persistent: Store = supabaseAdmin ? new SupabaseStore(supabaseAdmin) : memoryStore;

/** Los invitados siempre van a memoria; las cuentas reales a Supabase si está configurado. */
export function storeFor(userId: string): Store {
  return userId.startsWith("guest:") ? memoryStore : persistent;
}
