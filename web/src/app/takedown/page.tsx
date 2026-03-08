import { FlashMessage } from "@/components/flash-message";
import { TAKEDOWN_NOTICE, TAKEDOWN_REASONS } from "@/lib/constants";
import { submitTakedownAction } from "@/lib/actions";

export const metadata = {
  title: "削除申請 | Shift Notes",
};

export default async function TakedownPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const message =
    typeof params.status === "string" ? decodeURIComponent(params.status) : undefined;
  const tone =
    typeof params.kind === "string" && params.kind === "error" ? "error" : "success";

  return (
    <div className="space-y-8">
      <section className="section-card px-8 py-10">
        <span className="eyebrow">Takedown</span>
        <h1 className="heading-display mt-4 text-5xl font-bold">削除申請フォーム</h1>
        <div className="mt-5 max-w-3xl rounded-[24px] border border-warning/20 bg-warning/10 p-5 text-sm leading-7 text-warning">
          {TAKEDOWN_NOTICE}
        </div>
      </section>

      <FlashMessage message={message} tone={tone} />

      <form action={submitTakedownAction} className="section-card max-w-4xl space-y-6 px-8 py-8">
        <label className="block space-y-2">
          <span className="text-sm font-semibold">対象URL</span>
          <input name="targetUrl" type="url" required placeholder="https://example.com/places/..." />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold">氏名</span>
            <input name="contactName" required placeholder="例: 山田 太郎" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">連絡先メール</span>
            <input name="contactEmail" type="email" required placeholder="contact@example.com" />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold">理由</span>
          <select name="reason" defaultValue={TAKEDOWN_REASONS[0]}>
            {TAKEDOWN_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold">証拠URL（任意）</span>
          <input
            name="evidenceUrl"
            type="url"
            placeholder="社内案内や本人確認資料の保管先 URL があれば入力"
          />
        </label>

        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong"
        >
          削除申請を送る
        </button>
      </form>
    </div>
  );
}
