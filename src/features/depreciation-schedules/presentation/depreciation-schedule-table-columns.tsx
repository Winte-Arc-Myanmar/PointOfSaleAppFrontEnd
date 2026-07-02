import type { DataTableColumn } from "@/presentation/components/data-table";
import type { DepreciationSchedule } from "@/core/domain/entities/DepreciationSchedule";
import { formatDate } from "@/presentation/components/detail";

type DepreciationScheduleTableColumnOptions = {
  onView?: (schedule: DepreciationSchedule) => void;
};

function postedClassName(isPosted: boolean): string {
  if (isPosted) {
    return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400";
  }
  return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400";
}

export function getDepreciationScheduleTableColumns(
  options: DepreciationScheduleTableColumnOptions = {}
): DataTableColumn<DepreciationSchedule>[] {
  const { onView } = options;

  return [
    {
      key: "scheduledDate",
      header: "Scheduled Date",
      sortable: true,
      className: "min-w-[130px]",
      render: (s) =>
        onView ? (
          <button
            type="button"
            className="text-sm text-foreground hover:text-mint transition-colors"
            onClick={() => onView(s)}
          >
            {formatDate(s.scheduledDate)}
          </button>
        ) : (
          <span className="text-sm text-foreground">{formatDate(s.scheduledDate)}</span>
        ),
    },
    {
      key: "depreciationAmount",
      header: "Amount",
      sortable: true,
      className: "min-w-[110px]",
      render: (s) => (
        <span className="font-mono text-sm text-foreground">{s.depreciationAmount}</span>
      ),
    },
    {
      key: "isPosted",
      header: "Posted",
      className: "min-w-[100px]",
      render: (s) => (
        <span
          className={`rounded-md border px-2 py-1 text-xs font-medium ${postedClassName(s.isPosted)}`}
        >
          {s.isPosted ? "Posted" : "Pending"}
        </span>
      ),
    },
    {
      key: "postedJournalEntryId",
      header: "Journal Entry",
      className: "min-w-[140px]",
      render: (s) => (
        <span className="font-mono text-xs text-muted truncate" title={s.postedJournalEntryId ?? ""}>
          {s.postedJournalEntryId ?? "—"}
        </span>
      ),
    },
  ];
}
