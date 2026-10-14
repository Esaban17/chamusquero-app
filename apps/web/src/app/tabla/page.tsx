import type { Metadata } from "next";
import { divisionName, getTeam, type DivisionId } from "@chamusqueros/shared";
import { Crest } from "@/components/crest";
import { getSessionUser, hasSupabaseEnv } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tabla · Chamusqueros" };

type Row = {
  id: string;
  username: string;
  favorite_team_id: string | null;
  division: DivisionId;
  titles: number;
  wins: number;
  losses: number;
};

const ORDER: Record<DivisionId, number> = { "liga-nacional": 0, primera: 1, segunda: 2, tercera: 3 };

export default async function TablePage() {
  if (!hasSupabaseEnv) {
    return <p className="card text-muted">La tabla aparece cuando la app está conectada a Supabase.</p>;
  }
  const supabase = await createClient();
  const { user } = await getSessionUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, favorite_team_id, division, titles, wins, losses")
    .not("favorite_team_id", "is", null)
    .order("titles", { ascending: false })
    .order("wins", { ascending: false })
    .limit(200)
    .returns<Row[]>();

  const rows = (data ?? [])
    .sort((a, b) => b.titles - a.titles || ORDER[a.division] - ORDER[b.division] || b.wins - a.wins)
    .slice(0, 50);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Tabla de chamusqueros</h1>
      {error && <p className="text-red-600">No pudimos cargar la tabla.</p>}
      <ol className="card divide-y divide-line p-0">
        {rows.map((r, i) => {
          const team = r.favorite_team_id ? getTeam(r.favorite_team_id) : undefined;
          return (
            <li key={r.id} className={`flex items-center gap-3 px-4 py-3 ${r.id === user?.id ? "bg-pitch/10" : ""}`}>
              <span className="w-6 text-right font-mono text-muted">{i + 1}</span>
              {team && <Crest team={team} size={28} />}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.username}</p>
                <p className="truncate text-xs text-muted">
                  {team?.name} · {divisionName(r.division)}
                </p>
              </div>
              <span className="text-sm tabular-nums">
                {r.titles > 0 && `🏆${r.titles} · `}
                {r.wins}G {r.losses}P
              </span>
            </li>
          );
        })}
        {rows.length === 0 && <li className="px-4 py-6 text-center text-muted">Todavía nadie ha jugado.</li>}
      </ol>
    </section>
  );
}
