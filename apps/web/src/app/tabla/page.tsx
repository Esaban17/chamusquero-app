import type { Metadata } from "next";
import Link from "next/link";
import { DIVISIONS, SEASON_LENGTH, getTeam, type DivisionId } from "@chamusqueros/shared";
import { Crest } from "@/components/crest";
import { getSessionUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tabla · Chamusqueros" };

type Row = {
  id: string;
  username: string;
  favorite_team_id: string;
  season_wins: number;
  season_losses: number;
  titles: number;
  wins: number;
  losses: number;
};

/** Tabla de una liga: los jugadores con cuenta de esa división, por la temporada en curso. */
export default async function TablePage({ searchParams }: { searchParams: Promise<{ division?: string }> }) {
  if (!sql) {
    return <p className="card text-muted">La tabla aparece cuando la app está conectada a la base de datos.</p>;
  }
  const user = await getSessionUser();
  const [mine] = user
    ? ((await sql`select division from profiles where id = ${user.id}`) as { division: DivisionId }[])
    : [];
  const requested = (await searchParams).division;
  const division = DIVISIONS.find((d) => d.id === requested)?.id ?? mine?.division ?? "tercera";

  const rows = (await sql`
    select id, username, favorite_team_id, season_wins, season_losses, titles, wins, losses
    from profiles
    where division = ${division} and favorite_team_id is not null
    order by season_wins desc, season_losses asc, titles desc, wins desc, username
    limit 100`) as Row[];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Tabla</h1>
      <nav aria-label="Divisiones" className="flex flex-wrap gap-2">
        {[...DIVISIONS].reverse().map((d) => (
          <Link
            key={d.id}
            href={`/tabla?division=${d.id}`}
            aria-current={d.id === division ? "page" : undefined}
            className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
              d.id === division ? "border-pitch bg-pitch text-white" : "border-line hover:bg-card"
            }`}
          >
            {d.name}
            {d.id === mine?.division && " · tu liga"}
          </Link>
        ))}
      </nav>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted">
            <tr className="border-b border-line">
              <th className="px-3 py-2 text-right">#</th>
              <th className="px-3 py-2">Jugador</th>
              <th className="px-3 py-2 text-center" title={`Temporada (máximo ${SEASON_LENGTH} partidos)`}>
                Temporada
              </th>
              <th className="px-3 py-2 text-center">Títulos</th>
              <th className="hidden px-3 py-2 text-center sm:table-cell">Historial</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const team = getTeam(r.favorite_team_id);
              return (
                <tr key={r.id} className={`border-b border-line last:border-0 ${r.id === user?.id ? "bg-pitch/10 font-semibold" : ""}`}>
                  <td className="px-3 py-2 text-right font-mono text-muted">{i + 1}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {team && <Crest team={team} size={24} />}
                      <div className="min-w-0">
                        <p className="truncate">
                          {r.username}
                          {r.id === user?.id && " (tú)"}
                        </p>
                        <p className="truncate text-xs font-normal text-muted">{team?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center tabular-nums">
                    {r.season_wins}G {r.season_losses}P
                  </td>
                  <td className="px-3 py-2 text-center tabular-nums">{r.titles > 0 ? `🏆 ${r.titles}` : "–"}</td>
                  <td className="hidden px-3 py-2 text-center tabular-nums text-muted sm:table-cell">
                    {r.wins}G {r.losses}P
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  Todavía nadie con cuenta juega en esta liga.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!user && (
        <p className="text-sm text-muted">
          Los invitados no aparecen en la tabla.{" "}
          <Link href="/login?modo=crear&next=/jugar" className="font-semibold text-pitch-strong hover:underline">
            Crea una cuenta
          </Link>{" "}
          para guardar tu progreso.
        </p>
      )}
    </section>
  );
}
