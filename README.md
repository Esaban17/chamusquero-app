# Chamusqueros ⚽

Juego web de penales multijugador del fútbol guatemalteco. Eliges a tu equipo favorito, arrancas en Tercera División y asciendes ganando tandas de penales en tiempo real hasta ser campeón de Liga Nacional.

## Estructura

| Carpeta | Qué es |
| --- | --- |
| `apps/web` | Next.js 16 (App Router + Tailwind). Landing, login con enlace mágico, pantalla de juego y tabla. Se despliega en Vercel. |
| `apps/server` | Servidor Socket.IO autoritativo: emparejamiento por división, bots de respaldo, tandas y progreso. Se despliega como servicio Node con WebSockets (Railway, Render o Fly). |
| `packages/shared` | Reglas puras compartidas: tanda de penales, ascensos y descensos, equipos reales y contrato de eventos del socket. |
| `supabase/migrations` | Esquema de base de datos (perfiles, partidas, RLS). |

Más detalle en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Correr en local

Requiere Node 22.18 o superior.

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
cp apps/server/.env.example apps/server/.env
npm run dev   # web en :3000, servidor de partidas en :4000
```

Sin variables de Supabase todo funciona en modo invitado y el progreso vive en memoria del servidor. Para cuentas reales, crea un proyecto en Supabase, aplica `supabase/migrations/0001_init.sql` y llena las variables de los dos `.env`.

## Comandos

```bash
npm test         # reglas del juego y pruebas del servidor con clientes Socket.IO reales
npm run typecheck
npm run lint
npm run build
```

## Equipos

Los equipos están en `packages/shared/src/teams.ts`. Liga Nacional y Primera División son los del Apertura 2026. La lista de Segunda está por verificar y la de Tercera usa combinados genéricos por departamento hasta conseguir la lista oficial. No se usan escudos oficiales: cada equipo tiene un escudo genérico con sus colores.
