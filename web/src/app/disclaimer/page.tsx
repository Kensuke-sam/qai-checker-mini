export const metadata = {
  title: "免責 | Shift Notes",
};

export default function DisclaimerPage() {
  return (
    <div className="section-card px-8 py-10">
      <span className="eyebrow">Disclaimer</span>
      <h1 className="heading-display mt-4 text-5xl font-bold">免責</h1>
      <div className="prose-safe mt-6 max-w-4xl leading-8 text-muted">
        <p>
          投稿内容の正確性、完全性、最新性を運営が保証するものではありません。各投稿は投稿者個人の主観的な体験談として掲載されます。
        </p>
        <p>
          運営は、中立的な表示、削除申請、当事者コメント、通報導線を用意し、公開後も必要に応じて確認と対応を行います。
        </p>
        <p>
          本ページの記載は一般的な運営方針の説明であり、法的助言を提供するものではありません。
        </p>
      </div>
    </div>
  );
}
