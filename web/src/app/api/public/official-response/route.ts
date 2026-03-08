import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { sendModerationNotification } from "@/lib/notifications";
import { getRequestFingerprint } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { sanitizePlainText } from "@/lib/text";
import {
  flattenFieldErrors,
  officialResponseInputSchema,
} from "@/lib/validation";

export async function POST(request: Request) {
  const supabase = getServiceSupabaseClient();
  const url = new URL("/official-response", request.url);

  if (!supabase) {
    url.searchParams.set("error", "Supabase サーバー設定が不足しているため送信できません。");
    return NextResponse.redirect(url);
  }

  const formData = await request.formData();
  const parsed = officialResponseInputSchema.safeParse({
    placeId: formData.get("placeId"),
    body: formData.get("body"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
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
    actionKey: "official_response_submission",
    subject: authorIp,
    windowMinutes: 60,
    maxHits: 4,
  });

  if (!limit.allowed) {
    url.searchParams.set(
      "error",
      "短時間に送信が集中しています。時間を空けて再試行してください。",
    );
    return NextResponse.redirect(url);
  }

  const { error } = await supabase.from("official_responses").insert({
    place_id: parsed.data.placeId,
    body: sanitizePlainText(parsed.data.body),
    status: "pending",
    contact_name: parsed.data.contactName
      ? sanitizePlainText(parsed.data.contactName)
      : null,
    contact_email: parsed.data.contactEmail ?? null,
  });

  if (error) {
    url.searchParams.set("error", "当事者コメントの保存に失敗しました。");
    return NextResponse.redirect(url);
  }

  await sendModerationNotification({
    category: "official_response_pending",
    subject: "当事者コメントが承認待ちです",
    summary: sanitizePlainText(parsed.data.body).slice(0, 120),
  });

  revalidatePath("/admin");
  url.searchParams.set("success", "当事者コメントを受け付けました。確認後に掲載します。");
  return NextResponse.redirect(url);
}
