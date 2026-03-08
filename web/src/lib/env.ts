import { DEFAULT_AREA_TAG, DEFAULT_MAP_CENTER, SITE_NAME } from "@/lib/constants";

const read = (value?: string) => value?.trim() || undefined;

export const env = {
  siteUrl: read(process.env.NEXT_PUBLIC_SITE_URL),
  supabaseUrl: read(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: read(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceRoleKey: read(process.env.SUPABASE_SERVICE_ROLE_KEY),
  moderationNotifyFunctionUrl: read(process.env.SUPABASE_MODERATION_NOTIFY_URL),
};

export const isPublicSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseAnonKey,
);

export const isServiceSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseServiceRoleKey,
);

export const isSupabaseConfigured = () => isPublicSupabaseConfigured;

export const appEnv = {
  siteName: SITE_NAME,
  areaTags: [DEFAULT_AREA_TAG],
  defaultAreaTag: DEFAULT_AREA_TAG,
  mapCenterLat: DEFAULT_MAP_CENTER.lat,
  mapCenterLng: DEFAULT_MAP_CENTER.lng,
  mapZoom: DEFAULT_MAP_CENTER.zoom,
  supabaseUrl: env.supabaseUrl ?? "",
  supabaseAnonKey: env.supabaseAnonKey ?? "",
};
