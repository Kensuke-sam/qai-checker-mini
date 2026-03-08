import { FlashMessage } from "@/components/flash-message";
import { AdminLoginForm } from "@/components/admin-login-form";

const errorMap: Record<string, string> = {
  "not-authorized": "管理者権限がありません。admins テーブルを確認してください。",
  "supabase-not-configured": "Supabase 設定が不足しています。",
};

export const metadata = {
  title: "管理ログイン | Shift Notes",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : "";
  const errorMessage = errorMap[errorCode];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="section-card px-8 py-10">
        <span className="eyebrow">Admin Login</span>
        <h1 className="heading-display mt-4 text-5xl font-bold">管理ログイン</h1>
        <p className="mt-4 max-w-2xl leading-8 text-muted">
          承認待ちキュー、通報、削除申請、当事者コメントを同じ画面で処理するための管理者ログインです。
        </p>
      </section>

      <FlashMessage message={errorMessage} tone={errorMessage ? "error" : "neutral"} />

      <section className="section-card px-8 py-8">
        <AdminLoginForm />
      </section>
    </div>
  );
}
