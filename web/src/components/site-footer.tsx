import Link from "next/link";

export const SiteFooter = () => (
  <footer className="border-t border-line/80 bg-card/70">
    <div className="container-shell flex flex-col gap-6 py-10 text-sm text-muted md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="heading-display text-lg font-bold text-foreground">
          中立表示と削除対応を前提にした運営設計
        </p>
        <p className="mt-2 leading-7">
          投稿は体験談として扱い、公開前に管理者が確認します。削除申請・訂正導線・監査ログ保持を前提にしたMVPです。
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/guidelines">投稿ガイドライン</Link>
        <Link href="/terms">利用規約</Link>
        <Link href="/disclaimer">免責</Link>
        <Link href="/official-response">当事者コメント送信</Link>
      </div>
    </div>
  </footer>
);
