import { env, isServiceSupabaseConfigured } from "@/lib/env";

type NotificationPayload = {
  subject: string;
  category: string;
  detailUrl?: string;
  summary: string;
};

export const sendModerationNotification = async (
  payload: NotificationPayload,
) => {
  if (!env.moderationNotifyFunctionUrl || !isServiceSupabaseConfigured) {
    return;
  }

  await fetch(env.moderationNotifyFunctionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  }).catch(() => undefined);
};
