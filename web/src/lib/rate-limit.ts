import { getServiceSupabaseClient } from "@/lib/supabase/server";

type ModernLimitOptions = {
  actionKey: string;
  subject: string;
  windowMinutes: number;
  maxHits: number;
};

type LegacyLimitOptions = {
  action: string;
  ip: string;
  ua?: string;
  limit: number;
  windowMinutes: number;
};

export const enforceRateLimit = async (
  options: ModernLimitOptions | LegacyLimitOptions,
) => {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return { allowed: true as const };
  }

  const actionKey = "actionKey" in options ? options.actionKey : options.action;
  const subject = "subject" in options ? options.subject : options.ip;
  const maxHits = "maxHits" in options ? options.maxHits : options.limit;
  const isLegacy = "action" in options;

  const windowMs = options.windowMinutes * 60 * 1000;
  const now = Date.now();
  const bucketStart = new Date(Math.floor(now / windowMs) * windowMs).toISOString();

  const { data: existing } = await supabase
    .from("rate_limits")
    .select("id, hits")
    .eq("action_key", actionKey)
    .eq("subject", subject)
    .eq("window_started_at", bucketStart)
    .maybeSingle();

  if (existing && existing.hits >= maxHits) {
    if (isLegacy) {
      throw new Error("短時間に送信が集中しています。時間を空けて再試行してください。");
    }

    return {
      allowed: false as const,
      retryAt: new Date(new Date(bucketStart).getTime() + windowMs),
    };
  }

  if (existing) {
    await supabase
      .from("rate_limits")
      .update({
        hits: existing.hits + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("rate_limits").insert({
      action_key: actionKey,
      subject,
      window_started_at: bucketStart,
      hits: 1,
    });
  }

  return { allowed: true as const };
};
