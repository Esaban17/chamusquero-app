"use client";

import { DIVISIONS, SELECTABLE_TEAMS } from "@penalitosgt/shared";
import { Crest } from "@/components/crest";

export function TeamPicker({ current, onPick }: { current: string | null; onPick: (teamId: string) => void }) {
  const divisions = [...DIVISIONS].reverse().filter((d) => SELECTABLE_TEAMS.some((t) => t.division === d.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Elige a tu equipo</h1>
        <p className="text-muted">
          Sea cual sea, arranca desde Tercera División. Tu trabajo es llevarlo hasta el título de Liga Nacional.
        </p>
      </div>
      {divisions.map((d) => (
        <section key={d.id}>
          <h2 className="mb-2 font-semibold text-muted">{d.name}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SELECTABLE_TEAMS.filter((t) => t.division === d.id).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onPick(t.id)}
                className={`card flex items-center gap-3 p-3 text-left transition hover:border-pitch ${
                  current === t.id ? "border-pitch ring-2 ring-pitch/40" : ""
                }`}
              >
                <Crest team={t} size={32} />
                <span className="text-sm font-semibold">{t.name}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
