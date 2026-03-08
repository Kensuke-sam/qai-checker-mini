import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import type { Review } from "@/lib/types";

export const ReviewCard = ({
  review,
  placeName,
}: {
  review: Review;
  placeName?: string;
}) => (
  <article className="rounded-[24px] border border-line bg-card px-6 py-5">
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        {placeName ? (
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-strong">
            {placeName}
          </p>
        ) : null}
        <h3 className="mt-2 text-xl font-bold">{review.title}</h3>
      </div>
      <StatusBadge status={review.status} />
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      {review.tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-strong"
        >
          {tag}
        </span>
      ))}
      {review.rating ? (
        <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold">
          参考評価 {review.rating}/5
        </span>
      ) : null}
    </div>
    <p className="mt-4 whitespace-pre-wrap leading-8 text-foreground/90">
      {review.body}
    </p>
    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted">
      <span>{new Date(review.created_at).toLocaleDateString("ja-JP")}</span>
      <Link
        href={`/report?targetType=review&targetId=${review.id}`}
        className="font-semibold text-accent-strong"
      >
        この投稿を通報
      </Link>
    </div>
  </article>
);
