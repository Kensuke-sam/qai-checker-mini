import type { AuditLog, OfficialResponse, Place, Report, Review, TakedownRequest } from "@/lib/types";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function getAdminDashboardData() {
  const supabase = createServiceSupabaseClient();

  const [
    { data: pendingPlaces, error: placeError },
    { data: pendingReviews, error: reviewError },
    { data: reports, error: reportError },
    { data: takedowns, error: takedownError },
    { data: pendingResponses, error: responseError },
    { data: auditLogs, error: auditError },
  ] = await Promise.all([
    supabase
      .from("places")
      .select("*")
      .neq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("reviews")
      .select("*, places(name)")
      .neq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("takedown_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("official_responses")
      .select("*, places(name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const firstError =
    placeError ??
    reviewError ??
    reportError ??
    takedownError ??
    responseError ??
    auditError;

  if (firstError) {
    throw new Error(firstError.message);
  }

  return {
    pendingPlaces: (pendingPlaces ?? []) as Place[],
    pendingReviews: ((pendingReviews ?? []) as (Review & { places?: { name?: string } | null })[]),
    reports: (reports ?? []) as Report[],
    takedowns: (takedowns ?? []) as TakedownRequest[],
    pendingResponses:
      ((pendingResponses ?? []) as (OfficialResponse & { places?: { name?: string } | null })[]),
    auditLogs: (auditLogs ?? []) as AuditLog[],
  };
}
