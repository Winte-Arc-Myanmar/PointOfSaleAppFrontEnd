import type { DataTableColumn } from "@/presentation/components/data-table";
import type { ReconciliationMatch } from "@/core/domain/entities/ReconciliationMatch";
import { formatDate } from "@/presentation/components/detail";

type ReconciliationMatchTableColumnOptions = {
  onView?: (match: ReconciliationMatch) => void;
};

export function getReconciliationMatchTableColumns(
  options: ReconciliationMatchTableColumnOptions = {},
): DataTableColumn<ReconciliationMatch>[] {
  const { onView } = options;

  return [
    {
      key: "statementLineId",
      header: "Statement Line",
      className: "min-w-[200px] max-w-[240px]",
      render: (m) =>
        onView ? (
          <button
            type="button"
            className="font-mono text-xs text-foreground truncate text-left hover:text-mint transition-colors"
            title={m.statementLineId}
            onClick={() => onView(m)}
          >
            {m.statementLineId}
          </button>
        ) : (
          <span className="font-mono text-xs text-foreground truncate" title={m.statementLineId}>
            {m.statementLineId}
          </span>
        ),
    },
    {
      key: "journalLineId",
      header: "Journal Line",
      className: "min-w-[200px] max-w-[240px]",
      render: (m) => (
        <span className="font-mono text-xs text-muted truncate" title={m.journalLineId}>
          {m.journalLineId}
        </span>
      ),
    },
    {
      key: "matchedBy",
      header: "Matched By",
      className: "min-w-[200px] max-w-[240px]",
      render: (m) => (
        <span className="font-mono text-xs text-muted truncate" title={m.matchedBy}>
          {m.matchedBy}
        </span>
      ),
    },
    {
      key: "matchedAt",
      header: "Matched At",
      sortable: true,
      className: "min-w-[140px]",
      render: (m) => (
        <span className="text-sm text-foreground">{formatDate(m.matchedAt ?? undefined)}</span>
      ),
    },
  ];
}
