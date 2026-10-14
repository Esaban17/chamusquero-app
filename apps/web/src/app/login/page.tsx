import { sendMagicLink } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sent?: string; error?: string }>;
}) {
  const { next = "/", sent, error } = await searchParams;

  return (
    <section className="card mx-auto max-w-md">
      <h1 className="mb-2 text-2xl font-bold">Entrar a Chamusqueros</h1>
      {sent ? (
        <p className="text-muted">Te mandamos un enlace a tu correo. Ábrelo en este mismo dispositivo para entrar.</p>
      ) : (
        <form action={sendMagicLink} className="space-y-4">
          <p className="text-muted">Sin contraseñas: te enviamos un enlace mágico a tu correo.</p>
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="email" className="label">
              Correo
            </label>
            <input id="email" name="email" type="email" required className="field" placeholder="tu@correo.com" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn w-full">Enviarme el enlace</button>
        </form>
      )}
    </section>
  );
}
