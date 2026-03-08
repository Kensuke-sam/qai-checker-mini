import { FlashMessage } from "@/components/flash-message";
import { REPORT_REASONS } from "@/lib/constants";
import { submitReportAction } from "@/lib/actions";

export const metadata = {
  title: "通報する | Shift Notes",
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const message =
    typeof params.status === "string" ? decodeURIComponent(params.status) : undefined;
  const tone =
    typeof params.kind === "string" && params.kind === "error" ? "error" : "success";
  const targetType =
    typeof params.targetType === "string" ? params.targetType : "review";
  const targetId = typeof params.targetId === "string" ? params.targetId : "";

  return (
    <div className="space-y-8">
      <section className="section-card px-8 py-10">
        <span className="eyebrow">Report</span>
        <h1 className="heading-display mt-4 text-5xl font-bold">投稿や勤務先を通報する</h1>
        <p className="mt-4 max-w-3xl leading-8 text-muted">
          個人特定、差別、虚偽の疑いなどがある場合は理由を選択してください。通報自体は公開されません。
        </p>
      </section>

      <FlashMessage message={message} tone={tone} />

      <form action={submitReportAction} className="section-card max-w-3xl space-y-6 px-8 py-8">
        <label className="block space-y-2">
          <span className="text-sm font-semibold">対象種別</span>
          <select name="targetType" defaultValue={targetType}>
            <option value="review">口コミ投稿</option>
            <option value="place">勤務先情報</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold">対象ID</span>
          <input name="targetId" defaultValue={targetId} required />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold">理由</span>
          <select name="reason" required defaultValue={REPORT_REASONS[0]}>
            {REPORT_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold">補足</span>
          <textarea
            name="detail"
            maxLength={1000}
            placeholder="どの部分が問題か、公開継続で困る点があれば記入してください。"
          />
        </label>

        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong"
        >
          通報を送る
        </button>
      </form>
    </div>
  );
}
