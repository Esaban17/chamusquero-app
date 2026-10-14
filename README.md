# penalitosGT ⚽

Juego web de penales multijugador del fútbol guatemalteco. Eliges a tu equipo favorito, arrancas en Tercera División y asciendes ganando tandas de penales en tiempo real hasta ser campeón de Liga Nacional.

## Estructura

| Carpeta | Qué es |
| --- | --- |
| `apps/web` | Next.js 16 (App Router + Tailwind). Landing, cuentas con correo y contraseña, pantalla de juego y tabla por liga. Se despliega en Vercel. |
| `apps/server` | Servidor Socket.IO autoritativo: emparejamiento por división, bots de respaldo, tandas y progreso. Se despliega en Vercel como segundo proyecto (WebSockets en Vercel Functions). |
| `packages/shared` | Reglas puras compartidas: tanda de penales, ascensos y descensos, equipos reales y contrato de eventos del socket. |
| `db/schema.sql` | Esquema de Postgres (Neon): cuentas, perfiles y partidas. |

Más detalle en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Correr en local

Requiere Node 22.18 o superior.

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
cp apps/server/.env.example apps/server/.env
npm run dev   # web en :3000, servidor de partidas en :4000
```

Sin `DATABASE_URL` todo funciona en modo invitado y el progreso vive en memoria del servidor. Para cuentas reales, usa una base Postgres (en producción, Neon desde el Marketplace de Vercel), aplica el esquema con `psql "$DATABASE_URL" -f db/schema.sql` y pon el mismo `DATABASE_URL` y `AUTH_SECRET` en los dos `.env`.

## Comandos

```bash
npm test         # reglas del juego y pruebas del servidor con clientes Socket.IO reales
npm run typecheck
npm run lint
npm run build
```

## Equipos

Los equipos están en `packages/shared/src/teams.ts`. Liga Nacional y Primera División son los del Apertura 2026. Tercera División son los 59 equipos del Apertura 2026 en 10 grupos. La lista de Segunda está por verificar. No se usan escudos oficiales: cada equipo tiene un escudo genérico con sus colores.
