import type { CaseStatus, ModerationStatus } from "@/lib/types";

const statusMap: Record<string, string> = {
  approved: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  rejected: "bg-red-500/10 text-red-700 border-red-200",
  received: "bg-sky-500/10 text-sky-700 border-sky-200",
  investigating: "bg-amber-500/10 text-amber-700 border-amber-200",
  resolved: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
};

const labelMap: Record<string, string> = {
  approved: "公開中",
  pending: "承認待ち",
  rejected: "非公開",
  received: "受付",
  investigating: "調査中",
  resolved: "対応済",
};

export const StatusBadge = ({
  status,
}: {
  status: ModerationStatus | CaseStatus;
}) => (
  <span
    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusMap[status]}`}
  >
    {labelMap[status]}
  </span>
);
