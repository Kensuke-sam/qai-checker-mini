import type { OfficialResponse } from "@/lib/types";

export const OfficialResponseCard = ({
  response,
}: {
  response: OfficialResponse;
}) => (
  <article className="rounded-[24px] border border-success/20 bg-success/5 px-6 py-5">
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-success">
      当事者コメント
    </p>
    <p className="mt-4 whitespace-pre-wrap leading-8 text-foreground/90">
      {response.body}
    </p>
    <p className="mt-4 text-sm text-muted">
      {new Date(response.created_at).toLocaleDateString("ja-JP")}
    </p>
  </article>
);
