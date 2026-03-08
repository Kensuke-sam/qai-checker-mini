import { FlashMessage } from "@/components/flash-message";
import { AdminSignOutButton } from "@/components/admin-sign-out-button";
import { StatusBadge } from "@/components/status-badge";
import { getAdminDashboardData } from "@/lib/data/admin";
import { requireAdminUser } from "@/lib/auth";
import {
  updateOfficialResponseStatusAction,
  updatePlaceStatusAction,
  updateReportStatusAction,
  updateReviewStatusAction,
  updateTakedownStatusAction,
} from "@/lib/actions";

export const metadata = {
  title: "管理画面 | Shift Notes",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const admin = await requireAdminUser();
  const dashboard = await getAdminDashboardData();
  const message =
    typeof params.status === "string" ? decodeURIComponent(params.status) : undefined;
  const tone =
    typeof params.kind === "string" && params.kind === "error" ? "error" : "success";

  return (
    <div className="space-y-8">
      <section className="section-card flex flex-col gap-6 px-8 py-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow">Admin Console</span>
          <h1 className="heading-display mt-4 text-5xl font-bold">承認・削除対応キュー</h1>
          <p className="mt-4 max-w-3xl leading-8 text-muted">
            {admin.email} としてログイン中です。投稿の公開可否、通報対応、削除申請、当事者コメント掲載をここで処理します。
          </p>
        </div>
        <AdminSignOutButton />
      </section>

      <FlashMessage message={message} tone={tone} />

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="section-card space-y-5 px-8 py-8">
          <div className="flex items-center justify-between">
            <h2 className="heading-display text-3xl font-bold">勤務先の承認待ち</h2>
            <span className="text-sm text-muted">{dashboard.pendingPlaces.length} 件</span>
          </div>
          {dashboard.pendingPlaces.map((place) => (
            <article key={place.id} className="rounded-[24px] border border-line bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{place.name}</h3>
                  <p className="mt-1 text-sm leading-7 text-muted">
                    {place.address || place.nearest_station || "住所未入力"}
                  </p>
                </div>
                <StatusBadge status={place.status} />
              </div>
              <form action={updatePlaceStatusAction} className="mt-4 space-y-4">
                <input type="hidden" name="placeId" value={place.id} />
                <textarea
                  name="moderationNote"
                  defaultValue={place.moderation_note ?? ""}
                  placeholder="編集依頼や非公開理由のメモ"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    name="status"
                    value="approved"
                    className="rounded-full bg-success px-4 py-2 text-sm font-semibold text-white"
                  >
                    公開
                  </button>
                  <button
                    type="submit"
                    name="status"
                    value="pending"
                    className="rounded-full border border-line px-4 py-2 text-sm font-semibold"
                  >
                    編集依頼
                  </button>
                  <button
                    type="submit"
                    name="status"
                    value="rejected"
                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    非公開 / 削除
                  </button>
                </div>
              </form>
            </article>
          ))}
        </div>

        <div className="section-card space-y-5 px-8 py-8">
          <div className="flex items-center justify-between">
            <h2 className="heading-display text-3xl font-bold">口コミの承認待ち</h2>
            <span className="text-sm text-muted">{dashboard.pendingReviews.length} 件</span>
          </div>
          {dashboard.pendingReviews.map((review) => (
            <article key={review.id} className="rounded-[24px] border border-line bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{review.title}</h3>
                  <p className="mt-1 text-sm text-muted">
                    勤務先: {review.places?.name || review.place_id}
                  </p>
                </div>
                <StatusBadge status={review.status} />
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground/85">
                {review.body}
              </p>
              <form action={updateReviewStatusAction} className="mt-4 space-y-4">
                <input type="hidden" name="reviewId" value={review.id} />
                <textarea
                  name="moderationNote"
                  defaultValue={review.moderation_note ?? ""}
                  placeholder="編集依頼や非公開理由のメモ"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    name="status"
                    value="approved"
                    className="rounded-full bg-success px-4 py-2 text-sm font-semibold text-white"
                  >
                    公開
                  </button>
                  <button
                    type="submit"
                    name="status"
                    value="pending"
                    className="rounded-full border border-line px-4 py-2 text-sm font-semibold"
                  >
                    編集依頼
                  </button>
                  <button
                    type="submit"
                    name="status"
                    value="rejected"
                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    非公開 / 削除
                  </button>
                </div>
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="section-card space-y-5 px-8 py-8">
          <div className="flex items-center justify-between">
            <h2 className="heading-display text-3xl font-bold">当事者コメント</h2>
            <span className="text-sm text-muted">{dashboard.pendingResponses.length} 件</span>
          </div>
          {dashboard.pendingResponses.map((response) => (
            <article key={response.id} className="rounded-[24px] border border-line bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{response.places?.name || response.place_id}</h3>
                  <p className="mt-1 text-sm text-muted">{response.contact_name || "担当者名未入力"}</p>
                </div>
                <StatusBadge status={response.status} />
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7">{response.body}</p>
              <form action={updateOfficialResponseStatusAction} className="mt-4 flex flex-wrap gap-3">
                <input type="hidden" name="responseId" value={response.id} />
                <button
                  type="submit"
                  name="status"
                  value="approved"
                  className="rounded-full bg-success px-4 py-2 text-sm font-semibold text-white"
                >
                  掲載
                </button>
                <button
                  type="submit"
                  name="status"
                  value="rejected"
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  非掲載
                </button>
              </form>
            </article>
          ))}
        </div>

        <div className="section-card space-y-5 px-8 py-8">
          <div className="flex items-center justify-between">
            <h2 className="heading-display text-3xl font-bold">通報一覧</h2>
            <span className="text-sm text-muted">{dashboard.reports.length} 件</span>
          </div>
          {dashboard.reports.map((report) => (
            <article key={report.id} className="rounded-[24px] border border-line bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{report.target_type} / {report.target_id}</p>
                  <p className="mt-1 text-sm leading-7 text-muted">{report.reason}</p>
                </div>
                <StatusBadge status={report.status} />
              </div>
              {report.detail ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{report.detail}</p>
              ) : null}
              <form action={updateReportStatusAction} className="mt-4 flex flex-wrap gap-3">
                <input type="hidden" name="reportId" value={report.id} />
                <button type="submit" name="status" value="received" className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
                  受付
                </button>
                <button type="submit" name="status" value="investigating" className="rounded-full border border-warning/30 bg-warning/10 px-4 py-2 text-sm font-semibold text-warning">
                  調査中
                </button>
                <button type="submit" name="status" value="resolved" className="rounded-full bg-success px-4 py-2 text-sm font-semibold text-white">
                  対応済
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="section-card space-y-5 px-8 py-8">
          <div className="flex items-center justify-between">
            <h2 className="heading-display text-3xl font-bold">削除申請一覧</h2>
            <span className="text-sm text-muted">{dashboard.takedowns.length} 件</span>
          </div>
          {dashboard.takedowns.map((request) => (
            <article key={request.id} className="rounded-[24px] border border-line bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{request.contact_name}</p>
                  <p className="mt-1 text-sm text-muted">{request.target_url}</p>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{request.reason}</p>
              <form action={updateTakedownStatusAction} className="mt-4 space-y-4">
                <input type="hidden" name="takedownId" value={request.id} />
                <textarea
                  name="adminNotes"
                  defaultValue={request.admin_notes ?? ""}
                  placeholder="調査メモや返信状況"
                />
                <div className="flex flex-wrap gap-3">
                  <button type="submit" name="status" value="received" className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
                    受付
                  </button>
                  <button type="submit" name="status" value="investigating" className="rounded-full border border-warning/30 bg-warning/10 px-4 py-2 text-sm font-semibold text-warning">
                    調査中
                  </button>
                  <button type="submit" name="status" value="resolved" className="rounded-full bg-success px-4 py-2 text-sm font-semibold text-white">
                    対応済
                  </button>
                </div>
              </form>
            </article>
          ))}
        </div>

        <div className="section-card space-y-5 px-8 py-8">
          <div className="flex items-center justify-between">
            <h2 className="heading-display text-3xl font-bold">監査ログ</h2>
            <span className="text-sm text-muted">{dashboard.auditLogs.length} 件</span>
          </div>
          <div className="space-y-4">
            {dashboard.auditLogs.map((log) => (
              <article key={log.id} className="rounded-[24px] border border-line bg-card p-4">
                <p className="text-sm font-semibold">{log.action}</p>
                <p className="mt-1 text-xs text-muted">
                  {new Date(log.created_at).toLocaleString("ja-JP")} / {log.target_type}
                  {log.target_id ? ` / ${log.target_id}` : ""}
                </p>
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950/90 p-3 text-xs text-slate-100">
                  {JSON.stringify(log.detail, null, 2)}
                </pre>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
