export const metadata = {
  title: "利用規約 | Shift Notes",
};

export default function TermsPage() {
  return (
    <div className="section-card px-8 py-10">
      <span className="eyebrow">Terms</span>
      <h1 className="heading-display mt-4 text-5xl font-bold">利用規約</h1>
      <div className="prose-safe mt-6 max-w-4xl leading-8 text-muted">
        <p>
          本サービスは、アルバイト先に関する体験談を中立的に共有する場です。運営は投稿内容を断定的事実として扱いません。
        </p>
        <p>
          投稿者は、自身の体験に基づく表現に限り投稿してください。個人情報、差別、脅迫、虚偽、断定的なレッテル貼りは禁止です。
        </p>
        <p>
          投稿・通報・削除申請・当事者コメントは、運営判断で非公開化、編集依頼、削除、掲載保留とする場合があります。
        </p>
        <p>
          開示請求や法令上の要請に備え、投稿時の内部識別子、IP、ユーザーエージェント、作成時刻を保持します。これらは通常の公開画面には表示しません。
        </p>
      </div>
    </div>
  );
}
