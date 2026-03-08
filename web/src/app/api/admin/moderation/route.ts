import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { writeAuditLog } from "@/lib/audit";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { sanitizePlainText } from "@/lib/text";

const MODERATION_TABLES = ["places", "reviews", "official_responses"] as const;
const STATUSES = ["approved", "pending", "rejected"] as const;

export async function POST(request: Request) {
  const admin = await requireAdminSession();
  const supabase = getServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const formData = await request.formData();
  const targetTable = String(formData.get("targetTable") || "");
  const targetId = String(formData.get("targetId") || "");
  const nextStatus = String(formData.get("nextStatus") || "");
  const adminNote = String(formData.get("adminNote") || "");

  if (
    !MODERATION_TABLES.includes(targetTable as (typeof MODERATION_TABLES)[number]) ||
    !STATUSES.includes(nextStatus as (typeof STATUSES)[number]) ||
    !targetId
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  await supabase
    .from(targetTable)
    .update({
      status: nextStatus,
      moderation_note: adminNote ? sanitizePlainText(adminNote) : null,
    })
    .eq("id", targetId);

  await writeAuditLog({
    actorUserId: admin.userId,
    action: `moderation.${nextStatus}`,
    targetTable,
    targetId,
    metadata: {
      note: adminNote ? sanitizePlainText(adminNote) : null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/places");
  return NextResponse.redirect(new URL("/admin", request.url));
}
