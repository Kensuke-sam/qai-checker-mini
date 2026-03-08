import { redirect } from "next/navigation";
import { getServerSupabaseClient, getServiceSupabaseClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/types";

export type AdminSession = {
  userId: string;
  email: string | null;
  role: AdminRole;
};

export const getAdminSession = async (): Promise<AdminSession | null> => {
  const serverClient = await getServerSupabaseClient();
  const serviceClient = getServiceSupabaseClient();

  if (!serverClient || !serviceClient) {
    return null;
  }

  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: adminRecord } = await serviceClient
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRecord) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    role: adminRecord.role,
  };
};

export const requireAdminSession = async () => {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return session;
};
