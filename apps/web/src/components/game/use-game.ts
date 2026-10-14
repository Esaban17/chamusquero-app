"use client";

import { useEffect, useReducer, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  DivisionId,
  HandshakeAuth,
  Kick,
  MatchEnd,
  MatchStart,
  Pick,
  PlayerView,
  ServerToClientEvents,
  Side,
  TurnInfo,
} from "@penalitosgt/shared";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type GameState = {
  connection: "connecting" | "online" | "offline" | "rejected";
  error: string | null;
  player: PlayerView | null;
  queue: { division: DivisionId; botAt: number } | null;
  match: MatchStart | null;
  turn: TurnInfo | null;
  myPick: Pick | null;
  rivalPicked: boolean;
  kicks: Kick[];
  /** Último tiro, mientras se muestra la animación. */
  lastKick: Kick | null;
  end: MatchEnd | null;
};

type Action =
  | { type: "connection"; value: GameState["connection"]; error?: string }
  | { type: "error"; message: string | null }
  | { type: "player"; player: PlayerView }
  | { type: "waiting"; division: DivisionId; botInMs: number }
  | { type: "left-queue" }
  | { type: "start"; match: MatchStart }
  | { type: "turn"; turn: TurnInfo }
  | { type: "my-pick"; pick: Pick }
  | { type: "picked"; side: Side }
  | { type: "kick"; kick: Kick; kicks: Kick[] }
  | { type: "end"; end: MatchEnd }
  | { type: "dismiss-result" };

const initial: GameState = {
  connection: "connecting",
  error: null,
  player: null,
  queue: null,
  match: null,
  turn: null,
  myPick: null,
  rivalPicked: false,
  kicks: [],
  lastKick: null,
  end: null,
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "connection":
      return { ...state, connection: action.value, error: action.error ?? (action.value === "online" ? null : state.error) };
    case "error":
      return { ...state, error: action.message };
    case "player":
      return { ...state, player: action.player };
    case "waiting":
      return { ...state, queue: { division: action.division, botAt: Date.now() + action.botInMs }, end: null };
    case "left-queue":
      return { ...state, queue: null };
    case "start": {
      const same = state.match?.matchId === action.match.matchId;
      return {
        ...state,
        queue: null,
        end: null,
        match: action.match,
        ...(same ? {} : { kicks: [], lastKick: null, turn: null, myPick: null, rivalPicked: false }),
      };
    }
    case "turn":
      return { ...state, turn: action.turn, myPick: null, rivalPicked: false, lastKick: null };
    case "my-pick":
      return { ...state, myPick: action.pick };
    case "picked":
      return state.match && action.side !== state.match.you ? { ...state, rivalPicked: true } : state;
    case "kick":
      return { ...state, kicks: action.kicks, lastKick: action.kick, turn: null };
    case "end":
      return {
        ...state,
        end: action.end,
        turn: null,
        player: state.player ? { ...state.player, progress: action.end.progress } : state.player,
      };
    case "dismiss-result":
      return { ...state, match: null, end: null, kicks: [], lastKick: null };
  }
}

/** Con cuenta, `token` es el que firma la página /jugar para identificarse con el servidor de partidas. */
export type Identity = { kind: "account"; token: string } | { kind: "guest"; guestId: string; guestName: string };

/** Conexión con el servidor de partidas y el estado del juego. */
export function useGame(identity: Identity | null) {
  const [state, dispatch] = useReducer(reducer, initial);
  const socketRef = useRef<GameSocket | null>(null);

  useEffect(() => {
    if (!identity) return;
    const url = process.env.NEXT_PUBLIC_GAME_SERVER_URL ?? "http://localhost:4000";
    const auth: HandshakeAuth =
      identity.kind === "account" ? { token: identity.token } : { guestId: identity.guestId, guestName: identity.guestName };
    const socket: GameSocket = io(url, { auth, transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => dispatch({ type: "connection", value: "online" }));
    socket.on("disconnect", () => dispatch({ type: "connection", value: "offline" }));
    socket.on("connect_error", (err) => dispatch({ type: "connection", value: "rejected", error: err.message }));
    socket.on("player:state", (player) => dispatch({ type: "player", player }));
    socket.on("queue:waiting", ({ division, botInMs }) => dispatch({ type: "waiting", division, botInMs }));
    socket.on("match:start", (match) => dispatch({ type: "start", match }));
    socket.on("match:turn", (turn) => dispatch({ type: "turn", turn }));
    socket.on("match:picked", ({ side }) => dispatch({ type: "picked", side }));
    socket.on("match:kick", ({ kick, kicks }) => dispatch({ type: "kick", kick, kicks }));
    socket.on("match:end", (end) => dispatch({ type: "end", end }));
    socket.on("app:error", (message) => dispatch({ type: "error", message }));

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [identity]);

  const emit = socketRef;
  const actions = {
    setTeam: (teamId: string) => emit.current?.emit("player:setTeam", teamId),
    joinQueue: () => {
      dispatch({ type: "error", message: null });
      emit.current?.emit("queue:join");
    },
    leaveQueue: () => {
      emit.current?.emit("queue:leave");
      dispatch({ type: "left-queue" });
    },
    pick: (pick: Pick) => {
      if (!state.match || state.myPick) return;
      dispatch({ type: "my-pick", pick });
      emit.current?.emit("match:pick", { matchId: state.match.matchId, pick });
    },
    forfeit: () => state.match && emit.current?.emit("match:forfeit", state.match.matchId),
    dismissResult: () => dispatch({ type: "dismiss-result" }),
    clearError: () => dispatch({ type: "error", message: null }),
  };

  return { state, actions };
}
