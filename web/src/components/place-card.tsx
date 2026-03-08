import Link from "next/link";
import type { PlaceWithCounts } from "@/lib/types";

export const PlaceCard = ({ place }: { place: PlaceWithCounts }) => (
  <article className="section-card fade-up p-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-strong">
          {place.area_tag}
        </p>
        <h3 className="heading-display mt-2 text-2xl font-bold">{place.name}</h3>
        <p className="mt-2 text-sm leading-7 text-muted">
          {place.address || place.nearest_station || "最寄り情報は審査後に表示"}
        </p>
      </div>
      <div className="rounded-2xl border border-line bg-card px-4 py-3 text-sm">
        <p className="text-muted">公開済み体験談</p>
        <p className="mt-1 text-2xl font-bold">{place.approved_review_count} 件</p>
      </div>
    </div>
    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
      <span className="rounded-full bg-accent/10 px-3 py-1 font-medium text-accent-strong">
        {place.nearest_station || "駅情報確認中"}
      </span>
      <Link
        href={`/places/${place.id}`}
        className="rounded-full border border-line px-4 py-2 font-medium transition hover:border-accent/40 hover:text-accent-strong"
      >
        詳細を見る
      </Link>
    </div>
  </article>
);
