const env = process.env;

export const config = {
  port: Number(env.PORT ?? 4000),
  webOrigins: (env.WEB_ORIGIN ?? "http://localhost:3000").split(",").map((o) => o.trim()),
  /** Postgres (Neon). Sin esta variable todo se guarda en memoria (solo para desarrollo). */
  databaseUrl: env.DATABASE_URL ?? "",
  /** El mismo secreto que la web: verifica las sesiones de los jugadores con cuenta. */
  authSecret: env.AUTH_SECRET ?? "",
  allowGuests: env.ALLOW_GUESTS === "true",
  botWaitMs: Number(env.BOT_WAIT_MS ?? 15000),
  /** Pausa para mostrar el resultado de cada tiro antes del siguiente. */
  revealMs: Number(env.REVEAL_MS ?? 2500),
  /** Tiempo para reconectarse a una partida antes de perderla. */
  reconnectGraceMs: Number(env.RECONNECT_GRACE_MS ?? 15000),
};

export const hasDatabase = Boolean(config.databaseUrl);
