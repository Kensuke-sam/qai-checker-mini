import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { sendModerationNotification } from "@/lib/notifications";
import { getRequestFingerprint } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { sanitizePlainText } from "@/lib/text";
import { flattenFieldErrors, reportInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const supabase = getServiceSupabaseClient();
  const url = new URL("/report", request.url);

  if (!supabase) {
    url.searchParams.set("error", "Supabase サーバー設定が不足しているため送信できません。");
    return NextResponse.redirect(url);
  }

  const formData = await request.formData();
  const targetType = String(formData.get("targetType") || "");
  const targetId = String(formData.get("targetId") || "");
  const parsed = reportInputSchema.safeParse({
    targetType,
    targetId,
    reason: formData.get("reason"),
    detail: formData.get("detail"),
  });

  if (!parsed.success) {
    const errors = flattenFieldErrors(parsed);
    url.searchParams.set("targetType", targetType);
    url.searchParams.set("targetId", targetId);
    url.searchParams.set(
      "error",
      Object.values(errors).flat().filter(Boolean).join(" / ") ||
        "入力内容を確認してください。",
    );
    return NextResponse.redirect(url);
  }

  const { authorIp, authorUa } = await getRequestFingerprint();
  const limit = await enforceRateLimit({
    actionKey: "public_report_submission",
    subject: authorIp,
    windowMinutes: 30,
    maxHits: 10,
  });

  if (!limit.allowed) {
    url.searchParams.set("targetType", parsed.data.targetType);
    url.searchParams.set("targetId", parsed.data.targetId);
    url.searchParams.set(
      "error",
      "短時間に送信が集中しています。時間を空けて再試行してください。",
    );
    return NextResponse.redirect(url);
  }

  const { error } = await supabase.from("reports").insert({
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    reason: parsed.data.reason,
    detail: sanitizePlainText(parsed.data.detail),
    reporter_ip: authorIp,
    reporter_ua: authorUa,
    status: "received",
  });

  if (error) {
    url.searchParams.set("targetType", parsed.data.targetType);
    url.searchParams.set("targetId", parsed.data.targetId);
    url.searchParams.set("error", "通報の保存に失敗しました。");
    return NextResponse.redirect(url);
  }

  await sendModerationNotification({
    category: "report_received",
    subject: "新しい通報を受信しました",
    summary: `${parsed.data.targetType}: ${parsed.data.reason}`,
  });

  revalidatePath("/admin");
  url.searchParams.set("targetType", parsed.data.targetType);
  url.searchParams.set("targetId", parsed.data.targetId);
  url.searchParams.set("success", "通報を受け付けました。");
  return NextResponse.redirect(url);
}
