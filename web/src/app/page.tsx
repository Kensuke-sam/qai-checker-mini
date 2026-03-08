import Link from "next/link";
import { PlaceCard } from "@/components/place-card";
import { PlacesMap } from "@/components/places-map";
import { FlashMessage } from "@/components/flash-message";
import {
  DEFAULT_AREA_LABEL,
  DETAIL_DISCLAIMER,
  FACTUAL_NOTICE,
  SITE_NAME,
  SUBJECTIVE_NOTICE,
} from "@/lib/constants";
import { listApprovedPlaces } from "@/lib/queries/public";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const places = await listApprovedPlaces();
  const flash = typeof params.message === "string" ? params.message : undefined;

  return (
    <div className="space-y-10">
      <section className="section-card grid gap-10 px-8 py-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="fade-up">
          <span className="eyebrow">承認制 / 中立表示 / 削除対応</span>
          <h1 className="heading-display mt-5 max-w-4xl text-5xl font-bold leading-tight md:text-6xl">
            {DEFAULT_AREA_LABEL} の
            <br />
            バイト体験談を、放置しない前提で可視化する。
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            {SITE_NAME} は、勤務先に関する体験談を「主観」として共有する承認制MVPです。運営は断定せず、削除申請・訂正導線・当事者コメント掲載を標準仕様にしています。
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <div className="rounded-[24px] border border-line bg-card p-5">
              <p className="text-sm font-semibold text-accent-strong">
                投稿時に必ず表示
              </p>
              <p className="mt-2 leading-7">{SUBJECTIVE_NOTICE}</p>
            </div>
            <div className="rounded-[24px] border border-line bg-card p-5">
              <p className="text-sm font-semibold text-accent-strong">詳細ページの免責</p>
              <p className="mt-2 leading-7">{DETAIL_DISCLAIMER}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/submit"
              className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong"
            >
              体験談を送る
            </Link>
            <Link
              href="/takedown"
              className="rounded-full border border-line px-6 py-3 font-semibold transition hover:border-accent/40 hover:text-accent-strong"
            >
              削除申請へ
            </Link>
          </div>
        </div>
        <div className="fade-up rounded-[28px] border border-line bg-card-strong p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-strong">
            moderation flow
          </p>
          <ol className="mt-5 space-y-4">
            {[
              "投稿はすべて承認待ちで保存",
              "管理者が文言・個人特定・断定表現を確認",
              "通報 / 削除申請 / 当事者コメントを同じ管理画面で処理",
              "承認・非公開・編集依頼・削除の履歴を監査ログへ記録",
            ].map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-4 rounded-[22px] border border-line bg-background/80 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="leading-7">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-[22px] border border-warning/20 bg-warning/10 p-4">
            <p className="font-semibold text-warning">{FACTUAL_NOTICE}</p>
          </div>
        </div>
      </section>

      <FlashMessage message={flash} tone="success" />

      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="eyebrow">Map View</span>
              <h2 className="heading-display mt-4 text-4xl font-bold">
                地図から勤務先を探す
              </h2>
            </div>
            <Link href="/map" className="text-sm font-semibold text-accent-strong">
              地図ページへ
            </Link>
          </div>
          <PlacesMap places={places} />
        </div>
        <div className="space-y-5">
          <div>
            <span className="eyebrow">Recent Places</span>
            <h2 className="heading-display mt-4 text-4xl font-bold">
              公開中の勤務先
            </h2>
          </div>
          {places.slice(0, 3).map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>
    </div>
  );
}
