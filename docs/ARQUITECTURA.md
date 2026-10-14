# Arquitectura del MVP

## Vista general

```
Navegador ──HTTPS──▶ Next.js en Vercel (páginas, login, tabla)
    │                       │
    │                       └──▶ Supabase (Auth + Postgres, solo lectura desde la web)
    │
    └──WebSocket──▶ Servidor Socket.IO (Node) ──▶ Supabase (escritura con clave secreta)
```

- **La web no escribe en la base.** Todo cambio de progreso pasa por el servidor de partidas, que usa la clave secreta. RLS solo permite leer, así un jugador no puede subirse de división desde la consola del navegador.
- **El servidor es autoritativo.** Cada jugador manda su elección a ciegas (`match:pick`). El servidor no revela nada hasta tener ambas o hasta que se acaba el tiempo (10 s, después elige al azar). El azar (tiros altos que se van afuera) también vive en el servidor.
- **Autenticación del socket.** La web manda el access token de Supabase en el handshake; el servidor lo valida con `auth.getUser`. El token se pide de nuevo en cada reconexión, así no vence a media sesión.

## Reglas del juego

- Tanda: 5 tiros por lado y muerte súbita. Termina antes si ya no hay remontada posible.
- Portería de 6 zonas (izquierda, centro, derecha × arriba, abajo). El portero ataja si adivina lado y altura; si se queda al centro, ataja cualquier tiro al centro. Un tiro alto se va afuera el 15 % de las veces.
- Temporada: 3 victorias ascienden, 4 derrotas descienden, máximo 5 partidos. En Liga Nacional, 3 victorias suman un título.
- Emparejamiento: cola por división. Si nadie aparece en 15 s, juegas contra un bot que representa a un equipo real de tu división.
- Desconexión: 15 s de gracia para volver; después pierdes por abandono.

Todas estas constantes están en `packages/shared` y tienen pruebas.

## Eventos del socket

Definidos con tipos en `packages/shared/src/protocol.ts`:

| Cliente → servidor | Servidor → cliente |
| --- | --- |
| `player:setTeam`, `queue:join`, `queue:leave`, `match:pick`, `match:forfeit` | `player:state`, `queue:waiting`, `match:start`, `match:turn`, `match:picked`, `match:kick`, `match:end`, `app:error` |

## Límites conocidos del MVP

- **Una sola instancia del servidor.** Las colas y partidas viven en memoria. Para escalar a varias instancias hace falta el adaptador de Redis de Socket.IO y mover las colas a Redis.
- **Un reinicio del servidor corta las partidas en curso** (el progreso ya guardado no se pierde).
- **Invitados** (`ALLOW_GUESTS`) guardan progreso solo en memoria. En producción conviene apagarlo o limitarlo.

## Pendiente para lanzar

1. Crear el proyecto de Supabase, aplicar la migración y configurar el correo del enlace mágico (plantilla en español y URL de redirección del dominio).
2. Desplegar `apps/web` en Vercel con las variables de `apps/web/.env.example`.
3. Desplegar `apps/server` en un servicio con WebSockets (Railway, Render o Fly) con las variables de `apps/server/.env.example`, y apuntar `NEXT_PUBLIC_GAME_SERVER_URL` a su URL.
4. Verificar la lista de Segunda División (`packages/shared/src/teams.ts`) y confirmar colores de cada club.
5. Decidir si se piden permisos a los clubes o a la liga para usar escudos oficiales.
6. Dominio, política de privacidad y términos (se guardan correos).
7. Límite de conexiones por IP y monitoreo de errores del servidor.
