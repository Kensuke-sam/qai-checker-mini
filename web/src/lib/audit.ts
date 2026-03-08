import { getServiceSupabaseClient } from "@/lib/supabase/server";

type AuditPayload = {
  actorUserId: string | null;
  action: string;
  targetTable: string;
  targetId: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export const writeAuditLog = async ({
  actorUserId,
  action,
  targetTable,
  targetId,
  metadata = {},
}: AuditPayload) => {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return;
  }

  await supabase.from("audit_logs").insert({
    actor_user_id: actorUserId,
    action,
    target_table: targetTable,
    target_id: targetId,
    metadata,
  });
};
