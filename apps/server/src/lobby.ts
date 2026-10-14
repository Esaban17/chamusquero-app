import {
  applyResult,
  getTeam,
  teamsInDivision,
  type DivisionId,
  type PlayerView,
  type Side,
} from "@chamusqueros/shared";
import type { AuthUser } from "./auth.ts";
import { config } from "./config.ts";
import { Match, userRoom, type MatchResult, type Participant } from "./match.ts";
import { storeFor, type PlayerRecord } from "./store.ts";
import type { GameServer } from "./types.ts";

type Waiting = { user: AuthUser; player: PlayerRecord; botTimer: NodeJS.Timeout };

/** Emparejamiento por división, partidas activas y progreso al terminar. */
export class Lobby {
  private waiting = new Map<DivisionId, Waiting>();
  private matchByUser = new Map<string, Match>();
  private forfeitTimers = new Map<string, NodeJS.Timeout>();

  private io: GameServer;
  private random: () => number;

  constructor(io: GameServer, random: () => number = Math.random) {
    this.io = io;
    this.random = random;
  }

  async playerView(user: AuthUser): Promise<PlayerView> {
    const p = await storeFor(user.id).getPlayer(user.id, user.name);
    return { name: p.name, teamId: p.teamId, progress: p.progress };
  }

  async setTeam(user: AuthUser, teamId: string) {
    const team = getTeam(teamId);
    if (!team) throw new Error("Ese equipo no existe");
    if (this.matchByUser.has(user.id) || this.isWaiting(user.id)) throw new Error("No puedes cambiar de equipo en plena partida");
    await storeFor(user.id).setTeam(user.id, teamId);
  }

  async join(user: AuthUser) {
    const current = this.matchByUser.get(user.id);
    if (current) return current.resync(user.id);
    if (this.isWaiting(user.id)) return;

    const player = await storeFor(user.id).getPlayer(user.id, user.name);
    if (!player.teamId) throw new Error("Primero elige tu equipo");
    const division = player.progress.division;

    // Si mientras cargábamos ya se metió a la cola o a una partida, no duplicar.
    if (this.matchByUser.has(user.id) || this.isWaiting(user.id)) return;

    const rival = this.waiting.get(division);
    if (rival && rival.user.id !== user.id) {
      clearTimeout(rival.botTimer);
      this.waiting.delete(division);
      this.startMatch(division, [human(rival), human({ user, player })]);
      return;
    }

    const botTimer = setTimeout(() => this.startBotMatch(division), config.botWaitMs);
    this.waiting.set(division, { user, player, botTimer });
    this.io.to(userRoom(user.id)).emit("queue:waiting", { division, botInMs: config.botWaitMs });
  }

  leave(user: AuthUser) {
    for (const [division, w] of this.waiting) {
      if (w.user.id === user.id) {
        clearTimeout(w.botTimer);
        this.waiting.delete(division);
      }
    }
  }

  pick(user: AuthUser, matchId: string, pick: Parameters<Match["pick"]>[1]) {
    const match = this.matchByUser.get(user.id);
    if (match?.id === matchId) match.pick(user.id, pick);
  }

  forfeit(user: AuthUser, matchId: string) {
    const match = this.matchByUser.get(user.id);
    if (match?.id === matchId) match.forfeit(user.id);
  }

  /** Se llama cuando un usuario ya no tiene ninguna pestaña conectada. */
  disconnected(user: AuthUser) {
    this.leave(user);
    if (!this.matchByUser.has(user.id) || this.forfeitTimers.has(user.id)) return;
    this.forfeitTimers.set(
      user.id,
      setTimeout(() => {
        this.forfeitTimers.delete(user.id);
        this.matchByUser.get(user.id)?.forfeit(user.id);
      }, config.reconnectGraceMs),
    );
  }

  connected(user: AuthUser) {
    const timer = this.forfeitTimers.get(user.id);
    if (timer) clearTimeout(timer);
    this.forfeitTimers.delete(user.id);
    this.matchByUser.get(user.id)?.resync(user.id);
  }

  private isWaiting(userId: string) {
    return [...this.waiting.values()].some((w) => w.user.id === userId);
  }

  private startBotMatch(division: DivisionId) {
    const w = this.waiting.get(division);
    if (!w) return;
    this.waiting.delete(division);

    const options = teamsInDivision(division).filter((t) => t.id !== w.player.teamId);
    const rival = options[Math.floor(this.random() * options.length)];
    const bot: Participant = { userId: null, name: rival.name, teamId: rival.id, bot: true };
    this.startMatch(division, [human(w), bot]);
  }

  private startMatch(division: DivisionId, sides: [Participant, Participant]) {
    const match = new Match(this.io, division, sides, (m, r) => void this.finish(m, r), this.random);
    for (const s of sides) if (s.userId) this.matchByUser.set(s.userId, match);
    match.start();
  }

  private async finish(match: Match, result: MatchResult) {
    const [a, b] = match.finalScore;

    for (const side of [0, 1] as Side[]) {
      const p = match.sides[side];
      if (!p.userId) continue;
      this.matchByUser.delete(p.userId);
      const store = storeFor(p.userId);
      const won = result.winner === side;
      try {
        const player = await store.getPlayer(p.userId, p.name);
        const { progress, event } = applyResult(player.progress, won);
        await store.saveProgress(p.userId, progress, won);
        this.io.to(userRoom(p.userId)).emit("match:end", {
          matchId: match.id,
          winner: result.winner,
          reason: result.reason,
          progress,
          event,
        });
      } catch (err) {
        console.error("No se pudo guardar el progreso", p.userId, err);
        this.io.to(userRoom(p.userId)).emit("app:error", "No pudimos guardar el resultado de la tanda");
      }
    }

    const ids = match.sides.map((s) => (s.userId?.startsWith("guest:") ? null : s.userId)) as [string | null, string | null];
    if (ids[0] || ids[1]) {
      await storeFor(ids[0] ?? ids[1]!)
        .recordMatch({
          division: match.division,
          players: ids,
          teams: [match.sides[0].teamId, match.sides[1].teamId],
          score: [a, b],
          winner: result.winner,
          reason: result.reason,
        })
        .catch((err) => console.error("No se pudo registrar la partida", err));
    }
  }
}

function human({ user, player }: { user: AuthUser; player: PlayerRecord }): Participant {
  return { userId: user.id, name: player.name, teamId: player.teamId!, bot: false };
}
