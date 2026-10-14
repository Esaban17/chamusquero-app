import Link from "next/link";
import { DIVISIONS, teamsInDivision } from "@chamusqueros/shared";
import { Crest } from "@/components/crest";

export default function Home() {
  const featured = teamsInDivision("liga-nacional").slice(0, 6);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-pitch px-6 py-12 text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/70">Penales en línea</p>
        <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">De Tercera a campeón, a puro penal.</h1>
        <p className="mt-3 max-w-xl text-white/85">
          Elige a tu equipo del fútbol guatemalteco, enfrenta a otros aficionados en tandas de penales en tiempo real y
          asciende división por división hasta levantar el título de Liga Nacional.
        </p>
        <Link href="/jugar" className="btn mt-6 bg-white px-6 py-3 text-lg text-pitch-strong hover:bg-white/90">
          Jugar ahora
        </Link>
        <div className="mt-8 flex gap-3">
          {featured.map((t) => (
            <Crest key={t.id} team={t} size={40} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <h2 className="font-bold">1. Elige tu equipo</h2>
          <p className="text-sm text-muted">Equipos reales de Liga Nacional, Primera y Segunda División.</p>
        </div>
        <div className="card">
          <h2 className="font-bold">2. Gana la tanda</h2>
          <p className="text-sm text-muted">Cinco tiros por lado. Eliges a ciegas dónde tirar y hacia dónde lanzarte.</p>
        </div>
        <div className="card">
          <h2 className="font-bold">3. Asciende</h2>
          <p className="text-sm text-muted">3 victorias en la temporada te suben de división. 4 derrotas te bajan.</p>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 font-bold">La escalera</h2>
        <ol className="flex flex-col-reverse gap-2 sm:flex-row sm:items-end">
          {DIVISIONS.map((d, i) => (
            <li
              key={d.id}
              className="flex-1 rounded-lg bg-pitch/15 px-3 py-2 text-center font-semibold text-pitch-strong"
              style={{ paddingTop: `${0.5 + i * 0.6}rem`, paddingBottom: `${0.5 + i * 0.6}rem` }}
            >
              {d.name}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
