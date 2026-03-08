"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getClientIp, getClientUserAgent } from "@/lib/request";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { notifyModerators } from "@/lib/notify";
import {
  normalizeOfficialResponseInput,
  normalizeReportInput,
  normalizeReviewInput,
  normalizeTakedownInput,
  officialResponseSubmissionSchema,
  reportSubmissionSchema,
  reviewSubmissionSchema,
  takedownSubmissionSchema,
} from "@/lib/validation";
import { requireAdminUser } from "@/lib/auth";

async function getOrCreateAuthorId() {
  const cookieStore = await cookies();
  const current = cookieStore.get("btm_author_id")?.value;

  if (current) {
    return current;
  }

  const nextValue = crypto.randomUUID();

  cookieStore.set("btm_author_id", nextValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return nextValue;
}

async function writeAuditLog(input: {
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  detail?: Record<string, unknown>;
}) {
  const supabase = createServiceSupabaseClient();
  await supabase.from("audit_logs").insert({
    actor_user_id: input.actorUserId,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId,
    detail: input.detail ?? {},
  });
}

function redirectWithStatus(
  pathname: string,
  kind: "ok" | "error",
  status: string,
): never {
  redirect(`${pathname}?kind=${kind}&status=${encodeURIComponent(status)}`);
}

async function enforceOrRedirect(
  pathname: string,
  options: Parameters<typeof enforceRateLimit>[0],
) {
  try {
    await enforceRateLimit(options);
  } catch (error) {
    redirectWithStatus(
      pathname,
      "error",
      error instanceof Error ? error.message : "時間を空けて再度お試しください。",
    );
  }
}

export async function submitReviewAction(formData: FormData) {
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const ua = getClientUserAgent(headersList);

  await enforceOrRedirect("/submit", {
    action: "submit_review",
    ip,
    ua,
    limit: 3,
    windowMinutes: 60,
  });

  const parsed = reviewSubmissionSchema.safeParse({
    existingPlaceId: formData.get("existingPlaceId")?.toString() ?? "",
    newPlaceName: formData.get("newPlaceName")?.toString() ?? "",
    newPlaceAddress: formData.get("newPlaceAddress")?.toString() ?? "",
    newPlaceNearestStation: formData.get("newPlaceNearestStation")?.toString() ?? "",
    newPlaceLat: formData.get("newPlaceLat")?.toString() ?? "",
    newPlaceLng: formData.get("newPlaceLng")?.toString() ?? "",
    newPlaceAreaTag: formData.get("newPlaceAreaTag")?.toString() ?? "",
    title: formData.get("title")?.toString() ?? "",
    body: formData.get("body")?.toString() ?? "",
    tags: formData.getAll("tags").map((item) => item.toString()),
    rating: formData.get("rating")?.toString() ?? "",
    acceptedSubjective: formData.get("acceptedSubjective"),
    acceptedGuidelines: formData.get("acceptedGuidelines"),
  });

  if (!parsed.success) {
    redirectWithStatus("/submit", "error", parsed.error.issues[0]?.message ?? "入力内容を確認してください");
  }

  const payload = normalizeReviewInput(parsed.data);
  const supabase = createServiceSupabaseClient();
  const authorId = await getOrCreateAuthorId();

  let placeId = payload.existingPlaceId;

  if (!placeId) {
    const { data: place, error: placeError } = await supabase
      .from("places")
      .insert({
        name: payload.newPlaceName,
        address: payload.newPlaceAddress,
        nearest_station: payload.newPlaceNearestStation,
        lat: payload.newPlaceLat,
        lng: payload.newPlaceLng,
        area_tag: payload.newPlaceAreaTag,
        status: "pending",
      })
      .select("id")
      .single();

    if (placeError || !place) {
      redirectWithStatus("/submit", "error", placeError?.message ?? "勤務先を登録できませんでした");
    }

    placeId = place.id;
  }

  const { error } = await supabase.from("reviews").insert({
    place_id: placeId,
    title: payload.title,
    body: payload.body,
    tags: payload.tags,
    rating: payload.rating,
    status: "pending",
    author_id: authorId,
    author_ip: ip,
    author_ua: ua,
  });

  if (error) {
    redirectWithStatus("/submit", "error", error.message);
  }

  revalidatePath("/");
  revalidatePath("/map");
  revalidatePath("/places");

  await notifyModerators(
    "新しい口コミ投稿が承認待ちです",
    `review pending\nplace_id=${placeId}\ntitle=${payload.title}`,
  );

  redirectWithStatus("/submit", "ok", "投稿を受け付けました。公開前に運営が確認します。");
}

export async function submitReportAction(formData: FormData) {
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const ua = getClientUserAgent(headersList);

  await enforceOrRedirect("/report", {
    action: "submit_report",
    ip,
    ua,
    limit: 10,
    windowMinutes: 60,
  });

  const parsed = reportSubmissionSchema.safeParse({
    targetType: formData.get("targetType")?.toString() ?? "",
    targetId: formData.get("targetId")?.toString() ?? "",
    reason: formData.get("reason")?.toString() ?? "",
    detail: formData.get("detail")?.toString() ?? "",
  });

  if (!parsed.success) {
    redirectWithStatus("/report", "error", parsed.error.issues[0]?.message ?? "入力内容を確認してください");
  }

  const payload = normalizeReportInput(parsed.data);
  const supabase = createServiceSupabaseClient();

  const { error } = await supabase.from("reports").insert({
    target_type: payload.targetType,
    target_id: payload.targetId,
    reason: payload.reason,
    detail: payload.detail,
    reporter_ip: ip,
    reporter_ua: ua,
    status: "received",
  });

  if (error) {
    redirectWithStatus("/report", "error", error.message);
  }

  await notifyModerators(
    "新しい通報が届きました",
    `report received\ntarget_type=${payload.targetType}\ntarget_id=${payload.targetId}`,
  );

  redirectWithStatus("/report", "ok", "通報を受け付けました。内容を確認します。");
}

export async function submitTakedownAction(formData: FormData) {
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const ua = getClientUserAgent(headersList);

  await enforceOrRedirect("/takedown", {
    action: "submit_takedown",
    ip,
    ua,
    limit: 5,
    windowMinutes: 60,
  });

  const parsed = takedownSubmissionSchema.safeParse({
    targetUrl: formData.get("targetUrl")?.toString() ?? "",
    contactName: formData.get("contactName")?.toString() ?? "",
    contactEmail: formData.get("contactEmail")?.toString() ?? "",
    reason: formData.get("reason")?.toString() ?? "",
    evidenceUrl: formData.get("evidenceUrl")?.toString() ?? "",
  });

  if (!parsed.success) {
    redirectWithStatus("/takedown", "error", parsed.error.issues[0]?.message ?? "入力内容を確認してください");
  }

  const payload = normalizeTakedownInput(parsed.data);
  const supabase = createServiceSupabaseClient();

  const { error } = await supabase.from("takedown_requests").insert({
    target_url: payload.targetUrl,
    contact_name: payload.contactName,
    contact_email: payload.contactEmail,
    reason: payload.reason,
    evidence_url: payload.evidenceUrl,
    status: "received",
  });

  if (error) {
    redirectWithStatus("/takedown", "error", error.message);
  }

  await notifyModerators(
    "削除申請が届きました",
    `takedown request\nurl=${payload.targetUrl}\ncontact=${payload.contactEmail}\nip=${ip}\nua=${ua}`,
  );

  redirectWithStatus("/takedown", "ok", "削除申請を受け付けました。内容を確認のうえ連絡することがあります。");
}

export async function submitOfficialResponseAction(formData: FormData) {
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const ua = getClientUserAgent(headersList);

  await enforceOrRedirect(
    `/official-response?placeId=${encodeURIComponent(formData.get("placeId")?.toString() ?? "")}`,
    {
    action: "submit_official_response",
    ip,
    ua,
    limit: 5,
    windowMinutes: 60,
    },
  );

  const parsed = officialResponseSubmissionSchema.safeParse({
    placeId: formData.get("placeId")?.toString() ?? "",
    contactName: formData.get("contactName")?.toString() ?? "",
    contactEmail: formData.get("contactEmail")?.toString() ?? "",
    body: formData.get("body")?.toString() ?? "",
    acceptedGuidelines: formData.get("acceptedGuidelines"),
  });

  if (!parsed.success) {
    redirectWithStatus(
      `/official-response?placeId=${encodeURIComponent(formData.get("placeId")?.toString() ?? "")}`,
      "error",
      parsed.error.issues[0]?.message ?? "入力内容を確認してください",
    );
  }

  const payload = normalizeOfficialResponseInput(parsed.data);
  const supabase = createServiceSupabaseClient();

  const { error } = await supabase.from("official_responses").insert({
    place_id: payload.placeId,
    contact_name: payload.contactName,
    contact_email: payload.contactEmail,
    body: payload.body,
    status: "pending",
  });

  if (error) {
    redirectWithStatus(
      `/official-response?placeId=${encodeURIComponent(payload.placeId)}`,
      "error",
      error.message,
    );
  }

  await notifyModerators(
    "当事者コメントが届きました",
    `official response pending\nplace_id=${payload.placeId}\ncontact=${payload.contactName}\nip=${ip}\nua=${ua}`,
  );

  redirectWithStatus(
    `/official-response?placeId=${encodeURIComponent(payload.placeId)}`,
    "ok",
    "コメントを受け付けました。確認後に掲載可否を判断します。",
  );
}

export async function updatePlaceStatusAction(formData: FormData) {
  const admin = await requireAdminUser();
  const placeId = formData.get("placeId")?.toString();
  const status = formData.get("status")?.toString();
  const moderationNote = formData.get("moderationNote")?.toString() ?? null;

  if (!placeId || !status) {
    redirectWithStatus("/admin", "error", "勤務先の更新に失敗しました");
  }

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase
    .from("places")
    .update({ status, moderation_note: moderationNote })
    .eq("id", placeId);

  if (error) {
    redirectWithStatus("/admin", "error", error.message);
  }

  await writeAuditLog({
    actorUserId: admin.id,
    action: "place_status_updated",
    targetType: "place",
    targetId: placeId,
    detail: { status, moderationNote },
  });

  revalidatePath("/");
  revalidatePath("/map");
  revalidatePath("/places");
  revalidatePath("/admin");
  redirectWithStatus("/admin", "ok", "勤務先ステータスを更新しました");
}

export async function updateReviewStatusAction(formData: FormData) {
  const admin = await requireAdminUser();
  const reviewId = formData.get("reviewId")?.toString();
  const status = formData.get("status")?.toString();
  const moderationNote = formData.get("moderationNote")?.toString() ?? null;

  if (!reviewId || !status) {
    redirectWithStatus("/admin", "error", "口コミの更新に失敗しました");
  }

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase
    .from("reviews")
    .update({ status, moderation_note: moderationNote })
    .eq("id", reviewId);

  if (error) {
    redirectWithStatus("/admin", "error", error.message);
  }

  await writeAuditLog({
    actorUserId: admin.id,
    action: "review_status_updated",
    targetType: "review",
    targetId: reviewId,
    detail: { status, moderationNote },
  });

  revalidatePath("/");
  revalidatePath("/map");
  revalidatePath("/places");
  revalidatePath("/admin");
  redirectWithStatus("/admin", "ok", "口コミステータスを更新しました");
}

export async function updateOfficialResponseStatusAction(formData: FormData) {
  const admin = await requireAdminUser();
  const responseId = formData.get("responseId")?.toString();
  const status = formData.get("status")?.toString();

  if (!responseId || !status) {
    redirectWithStatus("/admin", "error", "当事者コメントの更新に失敗しました");
  }

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase
    .from("official_responses")
    .update({ status })
    .eq("id", responseId);

  if (error) {
    redirectWithStatus("/admin", "error", error.message);
  }

  await writeAuditLog({
    actorUserId: admin.id,
    action: "official_response_status_updated",
    targetType: "official_response",
    targetId: responseId,
    detail: { status },
  });

  revalidatePath("/places");
  revalidatePath("/admin");
  redirectWithStatus("/admin", "ok", "当事者コメントの状態を更新しました");
}

export async function updateReportStatusAction(formData: FormData) {
  const admin = await requireAdminUser();
  const reportId = formData.get("reportId")?.toString();
  const status = formData.get("status")?.toString();

  if (!reportId || !status) {
    redirectWithStatus("/admin", "error", "通報ステータスを更新できませんでした");
  }

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.from("reports").update({ status }).eq("id", reportId);

  if (error) {
    redirectWithStatus("/admin", "error", error.message);
  }

  await writeAuditLog({
    actorUserId: admin.id,
    action: "report_status_updated",
    targetType: "report",
    targetId: reportId,
    detail: { status },
  });

  revalidatePath("/admin");
  redirectWithStatus("/admin", "ok", "通報ステータスを更新しました");
}

export async function updateTakedownStatusAction(formData: FormData) {
  const admin = await requireAdminUser();
  const takedownId = formData.get("takedownId")?.toString();
  const status = formData.get("status")?.toString();
  const adminNotes = formData.get("adminNotes")?.toString() ?? null;

  if (!takedownId || !status) {
    redirectWithStatus("/admin", "error", "削除申請ステータスを更新できませんでした");
  }

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase
    .from("takedown_requests")
    .update({ status, admin_notes: adminNotes })
    .eq("id", takedownId);

  if (error) {
    redirectWithStatus("/admin", "error", error.message);
  }

  await writeAuditLog({
    actorUserId: admin.id,
    action: "takedown_status_updated",
    targetType: "takedown_request",
    targetId: takedownId,
    detail: { status, adminNotes },
  });

  revalidatePath("/admin");
  redirectWithStatus("/admin", "ok", "削除申請ステータスを更新しました");
}
