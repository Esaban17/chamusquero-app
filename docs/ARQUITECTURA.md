# Arquitectura del MVP

## Vista general

```
Navegador ──HTTPS──▶ Next.js en Vercel (páginas, cuentas, tabla) ──▶ Postgres en Neon
    │                                                                    ▲
    └──WebSocket──▶ Servidor Socket.IO en Vercel (partidas, progreso) ──┘
```

- **El progreso solo lo escribe el servidor de partidas.** La web crea cuentas y lee la tabla; ningún endpoint de la web cambia divisiones ni victorias, así un jugador no puede subirse de división desde la consola del navegador.
- **El servidor es autoritativo.** Cada jugador manda su elección a ciegas (`match:pick`). El servidor no revela nada hasta tener ambas o hasta que se acaba el tiempo (10 s, después elige al azar). El azar (tiros altos que se van afuera) también vive en el servidor.
- **Cuentas.** Correo y contraseña (scrypt con sal por usuario). La sesión es una cookie httpOnly firmada con HMAC (`AUTH_SECRET`, 30 días). Cinco intentos fallidos bloquean la cuenta 15 minutos.
- **Autenticación del socket.** La página `/jugar` firma un token corto (12 h) que el navegador manda en el handshake; el servidor lo verifica con el mismo `AUTH_SECRET`, sin consultar la base. Firma y verificación viven en `packages/shared/src/token.ts`.

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

- **Estado de partidas en memoria.** Las colas y partidas viven en la instancia que atiende la conexión. En Vercel las conexiones nuevas no siempre caen en la misma instancia y se cortan a los 5 minutos (el cliente reconecta). Para garantizar el emparejamiento entre humanos hace falta Redis.
- **Un reinicio del servidor corta las partidas en curso** (el progreso ya guardado no se pierde).
- **Invitados** (`ALLOW_GUESTS`) guardan progreso solo en memoria. En producción conviene apagarlo o limitarlo.

## Pendiente para lanzar

1. Recuperar contraseña (hoy no hay envío de correos).
2. Verificar la lista de Segunda División (`packages/shared/src/teams.ts`) y confirmar colores de cada club.
3. Decidir si se piden permisos a los clubes o a la liga para usar escudos oficiales.
4. Dominio, política de privacidad y términos (se guardan correos).
5. Límite de conexiones por IP y monitoreo de errores del servidor.
