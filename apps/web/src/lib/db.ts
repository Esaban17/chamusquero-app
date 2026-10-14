import { neon } from "@neondatabase/serverless";

/** Postgres (Neon). Sin DATABASE_URL no hay cuentas ni tabla: solo se juega como invitado. */
export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
