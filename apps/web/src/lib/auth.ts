import { createClient } from "@/lib/supabase/server";

export const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

/** Usuario con sesión, o null. Sin Supabase configurado (desarrollo) siempre es null. */
export async function getSessionUser() {
  if (!hasSupabaseEnv) return { supabase: null, user: null };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}
