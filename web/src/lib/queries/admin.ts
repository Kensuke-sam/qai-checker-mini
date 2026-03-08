import { cache } from "react";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import type {
  AuditLog,
  OfficialResponse,
  Place,
  Report,
  Review,
  TakedownRequest,
} from "@/lib/types";

type AdminDashboardData = {
  pendingPlaces: Place[];
  pendingReviews: Review[];
  pendingOfficialResponses: OfficialResponse[];
  reports: Report[];
  takedownRequests: TakedownRequest[];
  auditLogs: AuditLog[];
};

export const getAdminDashboardData = cache(async (): Promise<AdminDashboardData> => {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return {
      pendingPlaces: [],
      pendingReviews: [],
      pendingOfficialResponses: [],
      reports: [],
      takedownRequests: [],
      auditLogs: [],
    };
  }

  const [
    { data: pendingPlaces },
    { data: pendingReviews },
    { data: pendingOfficialResponses },
    { data: reports },
    { data: takedownRequests },
    { data: auditLogs },
  ] = await Promise.all([
    supabase
      .from("places")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("official_responses")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("reports")
      .select("*")
      .neq("status", "resolved")
      .order("created_at", { ascending: false }),
    supabase
      .from("takedown_requests")
      .select("*")
      .neq("status", "resolved")
      .order("created_at", { ascending: false }),
    supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return {
    pendingPlaces: (pendingPlaces ?? []) as Place[],
    pendingReviews: (pendingReviews ?? []) as Review[],
    pendingOfficialResponses:
      (pendingOfficialResponses ?? []) as OfficialResponse[],
    reports: (reports ?? []) as Report[],
    takedownRequests: (takedownRequests ?? []) as TakedownRequest[],
    auditLogs: (auditLogs ?? []) as AuditLog[],
  };
});
