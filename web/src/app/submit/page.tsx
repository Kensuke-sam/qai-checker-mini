import { FlashMessage } from "@/components/flash-message";
import {
  DEFAULT_AREA_LABEL,
  FACTUAL_NOTICE,
  PROHIBITED_ITEMS,
  REVIEW_TAGS,
  SUBJECTIVE_NOTICE,
} from "@/lib/constants";
import { listApprovedPlaces } from "@/lib/queries/public";
import { submitReviewAction } from "@/lib/actions";

export const metadata = {
  title: "体験談を送る | Shift Notes",
};

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const places = await listApprovedPlaces();
  const message =
    typeof params.status === "string" ? decodeURIComponent(params.status) : undefined;
  const tone =
    typeof params.kind === "string" && params.kind === "error" ? "error" : "success";

  return (
    <div className="space-y-8">
      <section className="section-card px-8 py-10">
        <span className="eyebrow">Submit</span>
        <h1 className="heading-display mt-4 text-5xl font-bold">体験談を送る</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
          <p>{SUBJECTIVE_NOTICE}</p>
          <p>{FACTUAL_NOTICE}</p>
        </div>
      </section>

      <FlashMessage message={message} tone={tone} />

      <form action={submitReviewAction} className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="section-card space-y-6 px-8 py-8">
          <div>
            <h2 className="heading-display text-3xl font-bold">勤務先を指定する</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              既存の勤務先を選ぶか、未登録なら新しい勤務先情報を入力してください。新規勤務先は承認後に公開されます。
            </p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">既存の勤務先</span>
            <select name="existingPlaceId" defaultValue="">
              <option value="">未登録なら下のフォームに入力</option>
              {places.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name} / {place.nearest_station || place.address || "住所確認中"}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold">新しい勤務先名</span>
              <input name="newPlaceName" placeholder="例: Cafe Lantern 池袋西口店 / なんば駅前店" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">都道府県・エリア</span>
              <input
                name="newPlaceAreaTag"
                defaultValue={DEFAULT_AREA_LABEL}
                placeholder="例: 東京都 / 大阪府 / 福岡市中央区"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold">住所</span>
              <input name="newPlaceAddress" placeholder="例: 大阪府大阪市北区梅田 1-2-3" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">最寄り駅</span>
              <input name="newPlaceNearestStation" placeholder="例: 梅田駅 / 札幌駅 / 博多駅" />
            </label>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold">緯度</span>
                <input name="newPlaceLat" placeholder="34.7025" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold">経度</span>
                <input name="newPlaceLng" placeholder="135.4959" />
              </label>
            </div>
          </div>
        </section>

        <section className="section-card space-y-6 px-8 py-8">
          <div>
            <h2 className="heading-display text-3xl font-bold">体験談の内容</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              良かった点も含めて、体験した順序が伝わる文章にしてください。断定よりも経緯が伝わることを優先します。
            </p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">見出し</span>
            <input
              name="title"
              required
              minLength={8}
              maxLength={80}
              placeholder="例: 研修は丁寧だったが、シフト連絡は直前になりがち"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">本文</span>
            <textarea
              name="body"
              required
              minLength={60}
              maxLength={2000}
              placeholder="例: 面接後から勤務開始まで、どのような説明があり、どの場面で困ったかを時系列で書いてください。"
            />
          </label>

          <div className="space-y-3">
            <p className="text-sm font-semibold">中立タグ</p>
            <div className="flex flex-wrap gap-3">
              {REVIEW_TAGS.map((tag) => (
                <label
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm"
                >
                  <input type="checkbox" name="tags" value={tag} className="h-4 w-4" />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          <label className="block max-w-xs space-y-2">
            <span className="text-sm font-semibold">任意評価</span>
            <select name="rating" defaultValue="">
              <option value="">評価しない</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value} / 5
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-[24px] border border-line bg-card p-5">
            <p className="text-sm font-semibold text-accent-strong">禁止事項</p>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-muted">
              {PROHIBITED_ITEMS.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 text-sm">
            <label className="flex items-start gap-3">
              <input type="checkbox" name="acceptedSubjective" required className="mt-1 h-4 w-4" />
              <span>{SUBJECTIVE_NOTICE}</span>
            </label>
            <label className="flex items-start gap-3">
              <input type="checkbox" name="acceptedGuidelines" required className="mt-1 h-4 w-4" />
              <span>{FACTUAL_NOTICE}</span>
            </label>
          </div>

          <button
            type="submit"
            className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong"
          >
            承認待ちで送信する
          </button>
        </section>
      </form>
    </div>
  );
}
