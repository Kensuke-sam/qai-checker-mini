import { FlashMessage } from "@/components/flash-message";
import { listApprovedPlaces } from "@/lib/queries/public";
import { submitOfficialResponseAction } from "@/lib/actions";

export const metadata = {
  title: "当事者コメント送信 | Shift Notes",
};

export default async function OfficialResponsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const selectedPlaceId =
    typeof params.placeId === "string" ? params.placeId : "";
  const message =
    typeof params.status === "string" ? decodeURIComponent(params.status) : undefined;
  const tone =
    typeof params.kind === "string" && params.kind === "error" ? "error" : "success";
  const places = await listApprovedPlaces();

  return (
    <div className="space-y-8">
      <section className="section-card px-8 py-10">
        <span className="eyebrow">Official Response</span>
        <h1 className="heading-display mt-4 text-5xl font-bold">訂正・反論・補足を送る</h1>
        <p className="mt-4 max-w-3xl leading-8 text-muted">
          当事者や企業からのコメントは運営に送信され、確認後に掲載可否を判断します。公開前に文面の調整をお願いする場合があります。
        </p>
      </section>

      <FlashMessage message={message} tone={tone} />

      <form action={submitOfficialResponseAction} className="section-card max-w-4xl space-y-6 px-8 py-8">
        <label className="block space-y-2">
          <span className="text-sm font-semibold">対象の勤務先</span>
          <select name="placeId" defaultValue={selectedPlaceId} required>
            <option value="">勤務先を選択してください</option>
            {places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold">担当者名</span>
            <input name="contactName" required placeholder="例: 店舗運営担当" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">連絡先メール（任意）</span>
            <input name="contactEmail" type="email" placeholder="ops@example.com" />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold">コメント本文</span>
          <textarea
            name="body"
            required
            minLength={40}
            maxLength={1500}
            placeholder="訂正したい点、補足したい運用変更、反論したい内容を具体的に記入してください。"
          />
        </label>

        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="acceptedGuidelines" required className="mt-1 h-4 w-4" />
          <span>内容確認のため運営から連絡する場合があることに同意します。</span>
        </label>

        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong"
        >
          運営へ送信する
        </button>
      </form>
    </div>
  );
}
