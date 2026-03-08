import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { sendModerationNotification } from "@/lib/notifications";
import { getRequestFingerprint } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { sanitizePlainText } from "@/lib/text";
import { flattenFieldErrors, takedownInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const supabase = getServiceSupabaseClient();
  const url = new URL("/takedown", request.url);

  if (!supabase) {
    url.searchParams.set("error", "Supabase サーバー設定が不足しているため送信できません。");
    return NextResponse.redirect(url);
  }

  const formData = await request.formData();
  const parsed = takedownInputSchema.safeParse({
    targetUrl: formData.get("targetUrl"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    reason: formData.get("reason"),
    evidenceUrl: formData.get("evidenceUrl"),
  });

  if (!parsed.success) {
    const errors = flattenFieldErrors(parsed);
    url.searchParams.set(
      "error",
      Object.values(errors).flat().filter(Boolean).join(" / ") ||
        "入力内容を確認してください。",
    );
    return NextResponse.redirect(url);
  }

  const { authorIp } = await getRequestFingerprint();
  const limit = await enforceRateLimit({
    actionKey: "takedown_submission",
    subject: authorIp,
    windowMinutes: 60,
    maxHits: 5,
  });

  if (!limit.allowed) {
    url.searchParams.set(
      "error",
      "短時間に送信が集中しています。時間を空けて再試行してください。",
    );
    return NextResponse.redirect(url);
  }

  const { error } = await supabase.from("takedown_requests").insert({
    target_url: parsed.data.targetUrl,
    contact_name: sanitizePlainText(parsed.data.contactName),
    contact_email: parsed.data.contactEmail,
    reason: sanitizePlainText(parsed.data.reason),
    evidence_url: parsed.data.evidenceUrl ?? null,
    status: "received",
  });

  if (error) {
    url.searchParams.set("error", "削除申請の保存に失敗しました。");
    return NextResponse.redirect(url);
  }

  await sendModerationNotification({
    category: "takedown_received",
    subject: "削除申請を受信しました",
    summary: parsed.data.targetUrl,
  });

  revalidatePath("/admin");
  url.searchParams.set("success", "削除申請を受け付けました。");
  return NextResponse.redirect(url);
}
