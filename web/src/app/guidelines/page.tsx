import { FACTUAL_NOTICE, PROHIBITED_ITEMS, SUBJECTIVE_NOTICE } from "@/lib/constants";

export const metadata = {
  title: "投稿ガイドライン | Shift Notes",
};

export default function GuidelinesPage() {
  return (
    <div className="space-y-8">
      <section className="section-card px-8 py-10">
        <span className="eyebrow">Guidelines</span>
        <h1 className="heading-display mt-4 text-5xl font-bold">投稿ガイドライン</h1>
        <div className="prose-safe mt-6 max-w-4xl leading-8 text-muted">
          <p>{SUBJECTIVE_NOTICE}</p>
          <p>{FACTUAL_NOTICE}</p>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="section-card px-8 py-8">
          <h2 className="heading-display text-3xl font-bold">歓迎する投稿</h2>
          <ul className="prose-safe mt-5 space-y-3 leading-8 text-muted">
            <li>研修、シフト、残業、休憩、人間関係などの体験談</li>
            <li>面接から退職までの時系列で分かる具体的なエピソード</li>
            <li>改善された点や、良かった対応も含めた中立的な記述</li>
          </ul>
        </div>
        <div className="section-card px-8 py-8">
          <h2 className="heading-display text-3xl font-bold">禁止事項</h2>
          <ul className="prose-safe mt-5 space-y-3 leading-8 text-muted">
            {PROHIBITED_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
