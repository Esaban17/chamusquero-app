import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { io as connect, type Socket } from "socket.io-client";
import { getTeam } from "@penalitosgt/shared";
import type { ClientToServerEvents, Column, MatchEnd, MatchStart, ServerToClientEvents } from "@penalitosgt/shared";
import { signSession } from "@penalitosgt/shared/token";

// Partidas rápidas, sin base de datos y con un secreto de prueba.
process.env.ALLOW_GUESTS = "true";
process.env.BOT_WAIT_MS = "300";
process.env.REVEAL_MS = "5";
process.env.AUTH_SECRET = "secreto-de-prueba";
delete process.env.DATABASE_URL;

type Client = Socket<ServerToClientEvents, ClientToServerEvents>;

let url = "";
let close = () => {};
const clients: Client[] = [];

before(async () => {
  const { createGameServer } = await import("./app.ts");
  const { http, io } = createGameServer();
  await new Promise<void>((resolve) => http.listen(0, resolve));
  url = `http://localhost:${(http.address() as AddressInfo).port}`;
  close = () => {
    io.close();
    http.close();
  };
});

after(() => {
  clients.forEach((c) => c.close());
  close();
});

function guest(name: string): Client {
  const client: Client = connect(url, {
    auth: { guestId: `${name}-${Math.random().toString(36).slice(2, 10)}`, guestName: name },
    transports: ["websocket"],
  });
  clients.push(client);
  return client;
}

/** Tira siempre a `shoot` y se lanza siempre a la izquierda abajo; espera el final. */
function autoplay(client: Client, shoot: Column = "L"): Promise<{ start: MatchStart; end: MatchEnd }> {
  return new Promise((resolve) => {
    let start: MatchStart;
    client.on("match:start", (s) => (start = s));
    client.on("match:turn", (t) => {
      const column = t.shooter === start.you ? shoot : "L";
      client.emit("match:pick", { matchId: t.matchId, pick: { column, height: "low" } });
    });
    client.on("match:end", (end) => resolve({ start, end }));
  });
}

const once = <E extends keyof ServerToClientEvents>(client: Client, event: E) =>
  new Promise<Parameters<ServerToClientEvents[E]>[0]>((resolve) =>
    // @ts-expect-error: el listener genérico no se estrecha por evento.
    client.once(event, resolve),
  );

test("rechaza conexiones sin sesión ni invitado válido", async () => {
  const client: Client = connect(url, { auth: {}, transports: ["websocket"] });
  clients.push(client);
  const err = await new Promise<Error>((resolve) => client.on("connect_error", resolve));
  assert.match(err.message, /iniciar sesión/);
});

test("una cuenta entra con el token que firma la web; uno falso o de otra audiencia no", async () => {
  const user = { id: "c0ffee00-0000-4000-8000-000000000002", name: "Con Cuenta" };
  const ok: Client = connect(url, { auth: { token: signSession(user, "socket", "secreto-de-prueba", 60) }, transports: ["websocket"] });
  clients.push(ok);
  assert.equal((await once(ok, "player:state")).name, "Con Cuenta");

  for (const token of [signSession(user, "socket", "otro-secreto", 60), signSession(user, "web", "secreto-de-prueba", 60)]) {
    const bad: Client = connect(url, { auth: { token }, transports: ["websocket"] });
    clients.push(bad);
    const err = await new Promise<Error>((resolve) => bad.on("connect_error", resolve));
    assert.match(err.message, /Sesión inválida/);
  }
});

test("no deja hacer cola sin equipo", async () => {
  const c = guest("SinEquipo");
  await once(c, "player:state");
  c.emit("queue:join");
  assert.match(await once(c, "app:error"), /elige tu equipo/);
});

test("dos jugadores de la misma división se enfrentan", async () => {
  const a = guest("Ana");
  const b = guest("Beto");
  await Promise.all([once(a, "player:state"), once(b, "player:state")]);

  a.emit("player:setTeam", "municipal");
  b.emit("player:setTeam", "comunicaciones");
  const [stateA] = await Promise.all([once(a, "player:state"), once(b, "player:state")]);
  assert.equal(stateA.teamId, "municipal");
  assert.equal(stateA.progress.division, "tercera");

  // Ana tira a donde Beto se lanza (siempre ataja); Beto tira al otro lado (siempre anota).
  const games = Promise.all([autoplay(a, "L"), autoplay(b, "R")]);
  a.emit("queue:join");
  b.emit("queue:join");
  const [ga, gb] = await games;

  assert.equal(ga.start.matchId, gb.start.matchId);
  assert.equal(ga.start.you, 0);
  assert.equal(gb.start.you, 1);
  assert.equal(ga.start.sides[1].bot, false);
  assert.equal(ga.end.winner, 1);
  assert.equal(gb.end.winner, 1);
  assert.equal(gb.end.progress.seasonWins, 1);
  assert.equal(ga.end.progress.seasonLosses, 1);
});

test("si no hay rival, juega contra un bot de un equipo real de su división", async () => {
  const c = guest("Solo");
  await once(c, "player:state");
  c.emit("player:setTeam", "xelaju");
  await once(c, "player:state");

  const game = autoplay(c);
  c.emit("queue:join");
  const waiting = await once(c, "queue:waiting");
  assert.equal(waiting.division, "tercera");

  const { start, end } = await game;
  assert.equal(start.sides[1].bot, true);
  assert.notEqual(start.sides[1].teamId, "xelaju");
  assert.equal(getTeam(start.sides[1].teamId)?.division, "tercera");
  assert.ok(end.winner === 0 || end.winner === 1);
});

test("abandonar da la victoria al rival", async () => {
  const c = guest("Abandona");
  await once(c, "player:state");
  c.emit("player:setTeam", "antigua");
  await once(c, "player:state");
  c.emit("queue:join");
  const start = await once(c, "match:start");
  c.emit("match:forfeit", start.matchId);
  const end = await once(c, "match:end");
  assert.equal(end.reason, "forfeit");
  assert.equal(end.winner, 1);
  assert.equal(end.progress.seasonLosses, 1);
});
