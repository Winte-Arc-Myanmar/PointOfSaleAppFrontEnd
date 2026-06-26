import type { DataTableColumn } from "@/presentation/components/data-table";
import type { JournalEntry } from "@/core/domain/entities/JournalEntry";
import { formatDate } from "@/presentation/components/detail";

type JournalEntryTableColumnOptions = {
  onView?: (entry: JournalEntry) => void;
};

function statusClassName(status: string): string {
  if (status === "POSTED") return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400";
  if (status === "DRAFT") return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400";
  return "border-border bg-muted text-foreground";
}

export function getJournalEntryTableColumns(
  options: JournalEntryTableColumnOptions = {},
): DataTableColumn<JournalEntry>[] {
  const { onView } = options;

  return [
    {
      key: "description",
      header: "Description",
      sortable: true,
      className: "min-w-[200px] max-w-[280px]",
      render: (e) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={e.description}
            onClick={() => onView(e)}
          >
            {e.description}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate" title={e.description}>
            {e.description}
          </span>
        ),
    },
    {
      key: "status",
      header: "Status",
      className: "min-w-[100px]",
      render: (e) => (
        <span
          className={`rounded-md border px-2 py-1 text-xs font-medium ${statusClassName(e.status)}`}
        >
          {e.status}
        </span>
      ),
    },
    {
      key: "sourceModule",
      header: "Source",
      className: "min-w-[120px]",
      render: (e) => (
        <span className="text-sm text-muted">{e.sourceModule}</span>
      ),
    },
    {
      key: "entryDate",
      header: "Entry Date",
      sortable: true,
      className: "min-w-[130px]",
      render: (e) => (
        <span className="text-sm text-foreground">{formatDate(e.entryDate ?? undefined)}</span>
      ),
    },
    {
      key: "periodId",
      header: "Period ID",
      className: "min-w-[200px] max-w-[240px]",
      render: (e) => (
        <span className="font-mono text-xs text-muted truncate" title={e.periodId}>
          {e.periodId}
        </span>
      ),
    },
  ];
}
