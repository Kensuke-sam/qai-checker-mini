import Link from "next/link";

export default function NotFound() {
  return (
    <div className="section-card px-8 py-16 text-center">
      <p className="eyebrow">404</p>
      <h1 className="heading-display mt-5 text-5xl font-bold">
        対象のページが見つかりません
      </h1>
      <p className="mx-auto mt-4 max-w-xl leading-8 text-muted">
        URLが変更されたか、まだ公開されていない可能性があります。
      </p>
      <Link
        href="/places"
        className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 font-semibold text-white"
      >
        勤務先一覧へ戻る
      </Link>
    </div>
  );
}
