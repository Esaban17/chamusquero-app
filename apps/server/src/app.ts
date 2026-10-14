import { createServer } from "node:http";
import { Server } from "socket.io";
import { isPick, type HandshakeAuth } from "@penalitosgt/shared";
import { authenticate } from "./auth.ts";
import { config } from "./config.ts";
import { Lobby } from "./lobby.ts";
import { userRoom } from "./match.ts";
import type { GameServer, GameSocket } from "./types.ts";

export function createGameServer() {
  const http = createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    res.writeHead(404).end();
  });

  const io: GameServer = new Server(http, { cors: { origin: config.webOrigins } });
  const lobby = new Lobby(io);

  io.use(async (socket, next) => {
    try {
      socket.data.user = await authenticate((socket.handshake.auth ?? {}) as HandshakeAuth);
      next();
    } catch (err) {
      next(err instanceof Error ? err : new Error("No autorizado"));
    }
  });

  /** Ejecuta un handler y convierte sus errores en un mensaje para el jugador. */
  const guard = (socket: GameSocket, fn: () => unknown) => async () => {
    try {
      await fn();
    } catch (err) {
      socket.emit("app:error", err instanceof Error ? err.message : "Algo salió mal");
    }
  };

  io.on("connection", async (socket) => {
    const user = socket.data.user;
    await socket.join(userRoom(user.id));
    await guard(socket, async () => socket.emit("player:state", await lobby.playerView(user)))();
    lobby.connected(user);

    socket.on("player:setTeam", (teamId) =>
      guard(socket, async () => {
        await lobby.setTeam(user, String(teamId));
        io.to(userRoom(user.id)).emit("player:state", await lobby.playerView(user));
      })(),
    );
    socket.on("queue:join", () => guard(socket, () => lobby.join(user))());
    socket.on("queue:leave", () => lobby.leave(user));
    socket.on("match:pick", (info) => {
      if (info && typeof info.matchId === "string" && isPick(info.pick)) {
        lobby.pick(user, info.matchId, { column: info.pick.column, height: info.pick.height });
      }
    });
    socket.on("match:forfeit", (matchId) => lobby.forfeit(user, String(matchId)));

    socket.on("disconnect", async () => {
      const remaining = await io.in(userRoom(user.id)).fetchSockets();
      if (remaining.length === 0) lobby.disconnected(user);
    });
  });

  return { http, io };
}
