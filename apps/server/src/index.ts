import { config, hasSupabase } from "./config.ts";
import { createGameServer } from "./app.ts";

const { http } = createGameServer();

http.listen(config.port, () => {
  console.log(
    `Servidor de penales en :${config.port} · datos: ${hasSupabase ? "Supabase" : "memoria"} · invitados: ${config.allowGuests ? "sí" : "no"}`,
  );
});
