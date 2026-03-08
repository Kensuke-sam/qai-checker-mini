import { createClient } from "@supabase/supabase-js";
import { env, isPublicSupabaseConfigured } from "@/lib/env";

export const getPublicSupabaseClient = () => {
  if (!isPublicSupabaseConfigured) {
    return null;
  }

  return createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    auth: { persistSession: false },
  });
};
