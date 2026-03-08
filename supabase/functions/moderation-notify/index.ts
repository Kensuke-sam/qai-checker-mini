import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type NotifyPayload = {
  subject?: string;
  body?: string;
};

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resendFrom = Deno.env.get("RESEND_FROM");
const adminRecipients = (Deno.env.get("ADMIN_NOTIFY_EMAILS") ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const payload = (await request.json().catch(() => ({}))) as NotifyPayload;
  const subject = payload.subject?.trim() || "新しいモデレーション項目があります";
  const body = payload.body?.trim() || "管理画面を確認してください。";

  if (!resendApiKey || !resendFrom || adminRecipients.length === 0) {
    return Response.json(
      {
        ok: true,
        skipped: true,
        reason: "Resend or recipients are not configured",
      },
      { status: 202 },
    );
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom,
      to: adminRecipients,
      subject,
      text: body,
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    return Response.json(
      {
        ok: false,
        error: errorText,
      },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
});
