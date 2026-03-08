"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, isPublicSupabaseConfigured } from "@/lib/env";

export const getBrowserSupabaseClient = () => {
  if (!isPublicSupabaseConfigured) {
    return null;
  }

  return createBrowserClient(env.supabaseUrl!, env.supabaseAnonKey!);
};

export const createBrowserSupabaseClient = () => {
  const client = getBrowserSupabaseClient();

  if (!client) {
    throw new Error("Supabase public env is not configured");
  }

  return client;
};
