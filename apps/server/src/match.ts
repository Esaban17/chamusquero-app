import { randomUUID } from "node:crypto";
import {
  PICK_SECONDS,
  botPick,
  nextShooter,
  randomPick,
  resolveKick,
  score,
  winner,
  type DivisionId,
  type Kick,
  type MatchSideInfo,
  type Pick,
  type Side,
} from "@penalitosgt/shared";
import { config } from "./config.ts";
import type { GameServer } from "./types.ts";

export type Participant = MatchSideInfo & { userId: string | null };

export type MatchResult = {
  winner: Side;
  reason: "shootout" | "forfeit";
  kicks: Kick[];
};

/**
 * Una tanda de penales autoritativa: el servidor guarda las elecciones a ciegas
 * y solo revela el tiro cuando ambos eligieron (o se acabó el tiempo).
 */
export class Match {
  readonly id = randomUUID();
  private kicks: Kick[] = [];
  private picks: [Pick | null, Pick | null] = [null, null];
  private deadline = 0;
  private timer: NodeJS.Timeout | null = null;
  private finished = false;

  private io: GameServer;
  readonly division: DivisionId;
  readonly sides: [Participant, Participant];
  private onFinish: (match: Match, result: MatchResult) => void;
  private random: () => number;

  constructor(
    io: GameServer,
    division: DivisionId,
    sides: [Participant, Participant],
    onFinish: (match: Match, result: MatchResult) => void,
    random: () => number = Math.random,
  ) {
    this.io = io;
    this.division = division;
    this.sides = sides;
    this.onFinish = onFinish;
    this.random = random;
  }

  get isFinished() {
    return this.finished;
  }

  sideOf(userId: string): Side | null {
    if (this.sides[0].userId === userId) return 0;
    if (this.sides[1].userId === userId) return 1;
    return null;
  }

  start() {
    for (const side of [0, 1] as Side[]) this.sendStart(side);
    this.nextTurn();
  }

  /** Reenvía el estado a un jugador que se reconectó. */
  resync(userId: string) {
    const side = this.sideOf(userId);
    if (side === null || this.finished) return;
    this.sendStart(side);
    const room = this.room(side);
    if (!room) return;
    if (this.kicks.length) {
      this.io.to(room).emit("match:kick", { matchId: this.id, kick: this.kicks.at(-1)!, kicks: this.kicks });
    }
    if (this.deadline > Date.now()) {
      this.io.to(room).emit("match:turn", {
        matchId: this.id,
        kickNumber: this.kicks.length + 1,
        shooter: nextShooter(this.kicks),
        deadline: this.deadline,
      });
    }
  }

  pick(userId: string, pick: Pick) {
    const side = this.sideOf(userId);
    if (side === null || this.finished || this.deadline === 0 || this.picks[side]) return;
    this.picks[side] = pick;
    this.broadcast((t) => t.emit("match:picked", { matchId: this.id, side }));
    if (this.picks[0] && this.picks[1]) this.resolve();
  }

  forfeit(userId: string) {
    const side = this.sideOf(userId);
    if (side === null || this.finished) return;
    this.finish((1 - side) as Side, "forfeit");
  }

  private sendStart(side: Side) {
    const room = this.room(side);
    if (!room) return;
    this.io.to(room).emit("match:start", {
      matchId: this.id,
      division: this.division,
      you: side,
      sides: [publicSide(this.sides[0]), publicSide(this.sides[1])],
    });
  }

  private nextTurn() {
    if (this.finished) return;
    const done = winner(this.kicks);
    if (done !== null) return this.finish(done, "shootout");

    const shooter = nextShooter(this.kicks);
    this.picks = [null, null];
    this.deadline = Date.now() + PICK_SECONDS * 1000;
    const turn = { matchId: this.id, kickNumber: this.kicks.length + 1, shooter, deadline: this.deadline };
    this.broadcast((t) => t.emit("match:turn", turn));

    for (const side of [0, 1] as Side[]) {
      if (this.sides[side].bot) {
        this.picks[side] = botPick(side === shooter ? "shooter" : "keeper", side, this.kicks, this.random);
      }
    }
    if (this.picks[0] && this.picks[1]) {
      this.resolve();
      return;
    }
    // Un pequeño margen para la latencia de red.
    this.timer = setTimeout(() => this.resolve(), PICK_SECONDS * 1000 + 500);
  }

  private resolve() {
    if (this.finished || this.deadline === 0) return;
    this.clearTimer();
    this.deadline = 0;

    const shooter = nextShooter(this.kicks);
    const keeper = (1 - shooter) as Side;
    const shot = this.picks[shooter] ?? randomPick(this.random);
    const dive = this.picks[keeper] ?? randomPick(this.random);
    const kick: Kick = { side: shooter, shot, dive, outcome: resolveKick(shot, dive, this.random) };
    this.kicks.push(kick);

    this.broadcast((t) => t.emit("match:kick", { matchId: this.id, kick, kicks: this.kicks }));
    this.timer = setTimeout(() => this.nextTurn(), config.revealMs);
  }

  private finish(winnerSide: Side, reason: MatchResult["reason"]) {
    if (this.finished) return;
    this.finished = true;
    this.clearTimer();
    this.onFinish(this, { winner: winnerSide, reason, kicks: this.kicks });
  }

  get finalScore() {
    return score(this.kicks);
  }

  private clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private room(side: Side) {
    const userId = this.sides[side].userId;
    return userId ? userRoom(userId) : null;
  }

  private broadcast(send: (target: ReturnType<GameServer["to"]>) => void) {
    const rooms = [this.room(0), this.room(1)].filter((r): r is string => r !== null);
    if (rooms.length) send(this.io.to(rooms));
  }
}

export const userRoom = (userId: string) => `user:${userId}`;

const publicSide = ({ name, teamId, bot }: Participant): MatchSideInfo => ({ name, teamId, bot });
