"use client";

import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

export const AdminSignOutButton = () => {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        const supabase = getBrowserSupabaseClient();
        if (!supabase) {
          router.replace("/admin/login");
          router.refresh();
          return;
        }

        await supabase.auth.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
      className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:border-accent/40 hover:text-accent-strong"
    >
      ログアウト
    </button>
  );
};
