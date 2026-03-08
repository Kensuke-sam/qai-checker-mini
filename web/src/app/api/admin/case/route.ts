import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { writeAuditLog } from "@/lib/audit";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { sanitizePlainText } from "@/lib/text";

const CASE_TABLES = ["reports", "takedown_requests"] as const;
const CASE_STATUSES = ["received", "investigating", "resolved"] as const;

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
    !CASE_TABLES.includes(targetTable as (typeof CASE_TABLES)[number]) ||
    !CASE_STATUSES.includes(nextStatus as (typeof CASE_STATUSES)[number]) ||
    !targetId
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  await supabase
    .from(targetTable)
    .update({
      status: nextStatus,
      admin_notes: adminNote ? sanitizePlainText(adminNote) : null,
    })
    .eq("id", targetId);

  await writeAuditLog({
    actorUserId: admin.userId,
    action: `case.${nextStatus}`,
    targetTable,
    targetId,
    metadata: {
      note: adminNote ? sanitizePlainText(adminNote) : null,
    },
  });

  revalidatePath("/admin");
  return NextResponse.redirect(new URL("/admin", request.url));
}
