/** Contrato de eventos Socket.IO entre la web y el servidor de partidas. */
import type { DivisionId, Progress, ProgressEvent } from "./divisions.ts";
import type { Kick, Pick, Side } from "./shootout.ts";

export type PlayerView = {
  name: string;
  teamId: string | null;
  progress: Progress;
};

export type MatchSideInfo = { name: string; teamId: string; bot: boolean };

export type MatchStart = {
  matchId: string;
  division: DivisionId;
  you: Side;
  sides: [MatchSideInfo, MatchSideInfo];
};

export type TurnInfo = {
  matchId: string;
  kickNumber: number;
  shooter: Side;
  /** Epoch en ms en que se acaba el tiempo para elegir. */
  deadline: number;
};

export type MatchEnd = {
  matchId: string;
  winner: Side;
  reason: "shootout" | "forfeit";
  progress: Progress;
  event: ProgressEvent;
};

export interface ServerToClientEvents {
  "player:state": (player: PlayerView) => void;
  "queue:waiting": (info: { division: DivisionId; botInMs: number }) => void;
  "match:start": (info: MatchStart) => void;
  "match:turn": (turn: TurnInfo) => void;
  "match:picked": (info: { matchId: string; side: Side }) => void;
  "match:kick": (info: { matchId: string; kick: Kick; kicks: Kick[] }) => void;
  "match:end": (info: MatchEnd) => void;
  "app:error": (message: string) => void;
}

export interface ClientToServerEvents {
  "player:setTeam": (teamId: string) => void;
  "queue:join": () => void;
  "queue:leave": () => void;
  "match:pick": (info: { matchId: string; pick: Pick }) => void;
  "match:forfeit": (matchId: string) => void;
}

/** token: access token de Supabase. Si el servidor permite invitados, se puede jugar con guestId + guestName. */
export type HandshakeAuth = { token?: string; guestId?: string; guestName?: string };
