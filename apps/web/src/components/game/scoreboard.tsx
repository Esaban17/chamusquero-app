import { REGULATION_ROUNDS, getTeam, score, type Kick, type MatchStart, type Side } from "@chamusqueros/shared";
import { Crest } from "@/components/crest";

const MARK = { goal: "bg-pitch", saved: "bg-red-500", miss: "bg-red-500" } as const;

export function Scoreboard({ match, kicks }: { match: MatchStart; kicks: Kick[] }) {
  const goals = score(kicks);
  const rounds = Math.max(REGULATION_ROUNDS, Math.ceil(kicks.length / 2));

  return (
    <div className="card grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      {([0, 1] as Side[]).map((side) => {
        const info = match.sides[side];
        const team = getTeam(info.teamId);
        const own = kicks.filter((k) => k.side === side);
        return (
          <div key={side} className={`flex items-center gap-3 ${side === 1 ? "order-3 flex-row-reverse text-right" : ""}`}>
            {team && <Crest team={team} size={40} />}
            <div className="min-w-0">
              <p className="truncate font-bold">{team?.name ?? info.teamId}</p>
              <p className="truncate text-xs text-muted">
                {info.bot ? "CPU" : info.name}
                {side === match.you && " · tú"}
              </p>
              <div className={`mt-1 flex gap-1 ${side === 1 ? "justify-end" : ""}`}>
                {Array.from({ length: rounds }, (_, i) => (
                  <span
                    key={i}
                    className={`h-3 w-3 rounded-full border border-line ${own[i] ? MARK[own[i].outcome] : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
      <p className="order-2 text-3xl font-black tabular-nums">
        {goals[0]} – {goals[1]}
      </p>
    </div>
  );
}
