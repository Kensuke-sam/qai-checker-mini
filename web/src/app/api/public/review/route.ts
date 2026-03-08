import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { DEFAULT_AREA_TAG } from "@/lib/constants";
import { sendModerationNotification } from "@/lib/notifications";
import { getRequestFingerprint } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { sanitizePlainText } from "@/lib/text";
import { flattenFieldErrors, reviewInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const supabase = getServiceSupabaseClient();
  const url = new URL("/submit", request.url);

  if (!supabase) {
    url.searchParams.set("error", "Supabase サーバー設定が不足しているため送信できません。");
    return NextResponse.redirect(url);
  }

  const formData = await request.formData();
  const parsed = reviewInputSchema.safeParse({
    placeId: formData.get("placeId"),
    placeName: formData.get("placeName"),
    placeAddress: formData.get("placeAddress"),
    placeNearestStation: formData.get("placeNearestStation"),
    title: formData.get("title"),
    body: formData.get("body"),
    tags: formData.getAll("tags"),
    rating: formData.get("rating") || undefined,
    confirmSubjective: formData.get("confirmSubjective") === "true",
    confirmGuideline: formData.get("confirmGuideline") === "true",
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

  const { authorIp, authorUa, visitorId } = await getRequestFingerprint();
  const limit = await enforceRateLimit({
    actionKey: "public_review_submission",
    subject: authorIp,
    windowMinutes: 30,
    maxHits: 5,
  });

  if (!limit.allowed) {
    url.searchParams.set(
      "error",
      "短時間に送信が集中しています。時間を空けて再試行してください。",
    );
    return NextResponse.redirect(url);
  }

  let placeId = parsed.data.placeId;

  if (!placeId) {
    const { data: createdPlace, error: placeError } = await supabase
      .from("places")
      .insert({
        name: sanitizePlainText(parsed.data.placeName!),
        address: parsed.data.placeAddress
          ? sanitizePlainText(parsed.data.placeAddress)
          : null,
        nearest_station: parsed.data.placeNearestStation
          ? sanitizePlainText(parsed.data.placeNearestStation)
          : null,
        lat: null,
        lng: null,
        area_tag: DEFAULT_AREA_TAG,
        status: "pending",
      })
      .select("id, name")
      .single();

    if (placeError || !createdPlace) {
      url.searchParams.set("error", "勤務先の登録に失敗しました。");
      return NextResponse.redirect(url);
    }

    placeId = createdPlace.id;

    await sendModerationNotification({
      category: "place_pending",
      subject: `新規勤務先が承認待ちです: ${createdPlace.name}`,
      summary: createdPlace.name,
    });
  }

  const { data: createdReview, error: reviewError } = await supabase
    .from("reviews")
    .insert({
      place_id: placeId,
      title: sanitizePlainText(parsed.data.title),
      body: sanitizePlainText(parsed.data.body),
      tags: parsed.data.tags,
      rating: parsed.data.rating ?? null,
      status: "pending",
      author_id: visitorId,
      author_ip: authorIp,
      author_ua: authorUa,
    })
    .select("id")
    .single();

  if (reviewError || !createdReview) {
    url.searchParams.set("error", "投稿の保存に失敗しました。");
    return NextResponse.redirect(url);
  }

  await sendModerationNotification({
    category: "review_pending",
    subject: "新しい体験談が承認待ちです",
    summary: sanitizePlainText(parsed.data.title),
  });

  revalidatePath("/");
  revalidatePath("/places");
  revalidatePath("/admin");

  url.searchParams.set("success", "体験談を承認待ちで受け付けました。");
  const response = NextResponse.redirect(url);
  response.cookies.set("visitor_id", visitorId, {
    sameSite: "lax",
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
