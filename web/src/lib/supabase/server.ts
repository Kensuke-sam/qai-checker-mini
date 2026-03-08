import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import {
  env,
  isPublicSupabaseConfigured,
  isServiceSupabaseConfigured,
} from "@/lib/env";

export const getServerSupabaseClient = async () => {
  if (!isPublicSupabaseConfigured) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot always mutate cookies during render.
        }
      },
    },
  });
};

export const getServiceSupabaseClient = () => {
  if (!isServiceSupabaseConfigured) {
    return null;
  }

  return createClient(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
    auth: { persistSession: false },
  });
};

export const createServerSupabaseClient = async () => {
  const client = await getServerSupabaseClient();

  if (!client) {
    throw new Error("Supabase public env is not configured");
  }

  return client;
};

export const createServiceSupabaseClient = () => {
  const client = getServiceSupabaseClient();

  if (!client) {
    throw new Error("Supabase service role is not configured");
  }

  return client;
};
