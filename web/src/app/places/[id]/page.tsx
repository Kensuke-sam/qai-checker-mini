import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { OfficialResponseCard } from "@/components/official-response-card";
import { ReviewCard } from "@/components/review-card";
import { DETAIL_DISCLAIMER } from "@/lib/constants";
import { getPublicPlaceDetail } from "@/lib/queries/public";

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getPublicPlaceDetail(id);

  if (!detail.place) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="section-card px-8 py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="eyebrow">{detail.place.area_tag}</span>
            <h1 className="heading-display mt-4 text-5xl font-bold">
              {detail.place.name}
            </h1>
            <p className="mt-4 max-w-3xl leading-8 text-muted">
              {detail.place.address || detail.place.nearest_station || "最寄り情報確認中"}
            </p>
          </div>
          <div className="rounded-[24px] border border-line bg-card p-5 text-sm leading-7 text-muted">
            <p>{DETAIL_DISCLAIMER}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/report?targetType=place&targetId=${detail.place.id}`}
                className="font-semibold text-accent-strong"
              >
                勤務先情報を通報
              </Link>
              <Link href="/takedown" className="font-semibold text-accent-strong">
                削除申請
              </Link>
              <Link
                href={`/official-response?placeId=${detail.place.id}`}
                className="font-semibold text-accent-strong"
              >
                当事者コメント送信
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="heading-display text-3xl font-bold">体験談</h2>
            <Link href="/submit" className="text-sm font-semibold text-accent-strong">
              この勤務先の体験談を送る
            </Link>
          </div>
          {detail.reviews.length ? (
            detail.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <EmptyState
              title="公開中の体験談はまだありません"
              description="最初の体験談を送ると、承認後にここへ表示されます。"
            />
          )}
        </div>
        <div className="space-y-5">
          <div>
            <h2 className="heading-display text-3xl font-bold">当事者コメント</h2>
            <p className="mt-2 leading-7 text-muted">
              当事者や企業から送られた訂正・反論・補足コメントは、管理者確認後に掲載します。
            </p>
          </div>
          {detail.officialResponses.length ? (
            detail.officialResponses.map((response) => (
              <OfficialResponseCard key={response.id} response={response} />
            ))
          ) : (
            <EmptyState
              title="掲載中の当事者コメントはありません"
              description="訂正や補足が必要な場合は、当事者コメント送信フォームから運営へ連絡できます。"
            />
          )}
        </div>
      </section>
    </div>
  );
}
