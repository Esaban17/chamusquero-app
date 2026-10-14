import Link from "next/link";

export default function NotFound() {
  return (
    <section className="card text-center">
      <h1 className="mb-2 text-2xl font-bold">Fuera de juego</h1>
      <p className="mb-4 text-muted">No encontramos esa página o esa chamusca.</p>
      <Link href="/" className="btn">
        Volver al inicio
      </Link>
    </section>
  );
}
