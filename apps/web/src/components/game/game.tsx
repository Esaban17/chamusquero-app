"use client";

import { useState } from "react";
import {
  LOSSES_TO_RELEGATE,
  SEASON_LENGTH,
  WINS_TO_PROMOTE,
  divisionName,
  getTeam,
  type ProgressEvent,
} from "@chamusqueros/shared";
import { Crest } from "@/components/crest";
import { useSecondsLeft } from "./countdown";
import { Goal } from "./goal";
import { Scoreboard } from "./scoreboard";
import { TeamPicker } from "./team-picker";
import { useGame, type Identity } from "./use-game";

const EVENT_TEXT: Record<Exclude<ProgressEvent, null>, (division: string) => string> = {
  promoted: (d) => `¡Ascendiste a ${d}!`,
  champion: () => "¡CAMPEÓN DE LIGA NACIONAL! 🏆",
  relegated: (d) => `Descendiste a ${d}. A levantarse.`,
  "new-season": (d) => `Temporada terminada. Sigues en ${d}.`,
};

export function Game({ identity }: { identity: Identity }) {
  const { state, actions } = useGame(identity);
  const [changingTeam, setChangingTeam] = useState(false);
  const turnSeconds = useSecondsLeft(state.turn?.deadline ?? null);
  const botSeconds = useSecondsLeft(state.queue?.botAt ?? null);

  if (state.connection === "rejected") {
    return <Notice title="No pudimos conectarte">{state.error ?? "Intenta de nuevo en un momento."}</Notice>;
  }
  if (!state.player) {
    return <Notice title="Conectando con el estadio…">Un momento.</Notice>;
  }

  const { player, match, turn, end } = state;
  const errorBanner = state.error && (
    <div className="mb-4 flex justify-between rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-700 dark:text-red-300">
      <span>{state.error}</span>
      <button onClick={actions.clearError} aria-label="Cerrar">
        ✕
      </button>
    </div>
  );
  const offline = state.connection === "offline" && (
    <p className="mb-4 rounded-lg bg-accent/20 px-4 py-2 text-sm">Se perdió la conexión. Reconectando…</p>
  );

  if (!player.teamId || (changingTeam && !match && !state.queue)) {
    return (
      <>
        {errorBanner}
        <TeamPicker
          current={player.teamId}
          onPick={(id) => {
            actions.setTeam(id);
            setChangingTeam(false);
          }}
        />
      </>
    );
  }

  const team = getTeam(player.teamId);

  if (match) {
    const role = turn ? (turn.shooter === match.you ? "shooter" : "keeper") : null;
    const won = end && end.winner === match.you;
    return (
      <div className="space-y-6">
        {offline}
        {errorBanner}
        <Scoreboard match={match} kicks={state.kicks} />

        {end ? (
          <div className="card space-y-3 text-center">
            <p className="text-4xl font-black">{won ? "¡Ganaste la tanda!" : "Perdiste la tanda"}</p>
            {end.reason === "forfeit" && (
              <p className="text-muted">{won ? "Tu rival abandonó." : "Abandonaste la partida."}</p>
            )}
            {end.event && (
              <p className="text-xl font-bold text-pitch-strong">
                {EVENT_TEXT[end.event](divisionName(end.progress.division))}
              </p>
            )}
            <SeasonProgress progress={end.progress} />
            <button className="btn" onClick={actions.dismissResult}>
              Continuar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">
                {role === "shooter" && "Tiras tú: elige dónde patear"}
                {role === "keeper" && "Atajas tú: elige hacia dónde lanzarte"}
                {!role && state.lastKick && `Tiro de ${getTeam(match.sides[state.lastKick.side].teamId)?.name ?? "rival"}`}
              </p>
              {turn && (
                <span
                  className={`rounded-full px-3 py-1 font-mono font-bold tabular-nums ${
                    turnSeconds <= 3 ? "bg-red-500 text-white" : "bg-card"
                  }`}
                >
                  {turnSeconds}s
                </span>
              )}
            </div>
            <Goal
              role={role ?? "shooter"}
              selected={turn ? state.myPick : null}
              disabled={!turn || !!state.myPick}
              reveal={state.lastKick}
              onPick={actions.pick}
            />
            <p className="text-center text-sm text-muted">
              {turn && state.myPick && (state.rivalPicked ? "Ambos eligieron…" : "Esperando al rival…")}
              {!state.myPick && turn && "Si no eliges a tiempo, se elige al azar."}
            </p>
            <div className="text-center">
              <button className="text-sm text-red-600 hover:underline" onClick={actions.forfeit}>
                Abandonar partida
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {offline}
      {errorBanner}
      <section className="card flex flex-wrap items-center gap-5">
        {team && <Crest team={team} size={72} />}
        <div className="flex-1">
          <p className="text-sm text-muted">{player.name}</p>
          <h1 className="text-2xl font-bold">{team?.name}</h1>
          <p className="font-semibold text-pitch-strong">{divisionName(player.progress.division)}</p>
          {player.progress.titles > 0 && <p className="text-sm">🏆 × {player.progress.titles}</p>}
        </div>
        <button className="text-sm text-muted hover:underline" onClick={() => setChangingTeam(true)}>
          Cambiar equipo
        </button>
      </section>

      <section className="card space-y-4">
        <SeasonProgress progress={player.progress} />
        {state.queue ? (
          <div className="space-y-3 text-center">
            <p className="text-lg font-semibold">Buscando rival en {divisionName(state.queue.division)}…</p>
            <p className="text-sm text-muted">
              {botSeconds > 0
                ? `Si nadie aparece en ${botSeconds}s, juegas contra un equipo de la división.`
                : "Preparando la cancha…"}
            </p>
            <button className="btn-ghost" onClick={actions.leaveQueue}>
              Cancelar
            </button>
          </div>
        ) : (
          <button className="btn w-full py-3 text-lg" onClick={actions.joinQueue} disabled={state.connection !== "online"}>
            Jugar tanda
          </button>
        )}
      </section>
    </div>
  );
}

function SeasonProgress({ progress }: { progress: { seasonWins: number; seasonLosses: number } }) {
  return (
    <div className="text-center">
      <p className="text-sm text-muted">
        Temporada: {WINS_TO_PROMOTE} victorias para ascender, {LOSSES_TO_RELEGATE} derrotas para descender (máximo{" "}
        {SEASON_LENGTH} partidos)
      </p>
      <div className="mt-2 flex justify-center gap-2" aria-label={`${progress.seasonWins} ganados, ${progress.seasonLosses} perdidos`}>
        {Array.from({ length: progress.seasonWins }, (_, i) => (
          <span key={`w${i}`} className="h-4 w-4 rounded-full bg-pitch" />
        ))}
        {Array.from({ length: progress.seasonLosses }, (_, i) => (
          <span key={`l${i}`} className="h-4 w-4 rounded-full bg-red-500" />
        ))}
        {Array.from({ length: Math.max(0, SEASON_LENGTH - progress.seasonWins - progress.seasonLosses) }, (_, i) => (
          <span key={`p${i}`} className="h-4 w-4 rounded-full border border-line" />
        ))}
      </div>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card mx-auto max-w-md text-center">
      <h1 className="mb-2 text-xl font-bold">{title}</h1>
      <p className="text-muted">{children}</p>
    </section>
  );
}
