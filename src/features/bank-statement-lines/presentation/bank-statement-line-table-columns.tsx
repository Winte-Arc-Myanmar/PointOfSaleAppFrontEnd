import type { DataTableColumn } from "@/presentation/components/data-table";
import type { BankStatementLine } from "@/core/domain/entities/BankStatementLine";
import { formatDate } from "@/presentation/components/detail";

type BankStatementLineTableColumnOptions = {
  onView?: (line: BankStatementLine) => void;
};

function statusClassName(status: string): string {
  if (status === "MATCHED") return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400";
  if (status === "UNMATCHED") return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400";
  return "border-border bg-muted text-foreground";
}

export function getBankStatementLineTableColumns(
  options: BankStatementLineTableColumnOptions = {},
): DataTableColumn<BankStatementLine>[] {
  const { onView } = options;

  return [
    {
      key: "transactionDate",
      header: "Date",
      sortable: true,
      className: "min-w-[120px]",
      render: (l) =>
        onView ? (
          <button
            type="button"
            className="text-sm text-foreground hover:text-mint transition-colors"
            onClick={() => onView(l)}
          >
            {formatDate(l.transactionDate)}
          </button>
        ) : (
          <span className="text-sm text-foreground">{formatDate(l.transactionDate)}</span>
        ),
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      className: "min-w-[180px] max-w-[260px]",
      render: (l) => (
        <span className="font-medium text-foreground truncate" title={l.description}>
          {l.description}
        </span>
      ),
    },
    {
      key: "referenceNumber",
      header: "Reference",
      className: "min-w-[120px]",
      render: (l) => (
        <span className="font-mono text-xs text-muted">{l.referenceNumber}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      className: "min-w-[110px]",
      render: (l) => (
        <span className="font-mono text-sm text-foreground">{l.amount}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "min-w-[110px]",
      render: (l) => (
        <span
          className={`rounded-md border px-2 py-1 text-xs font-medium ${statusClassName(l.status)}`}
        >
          {l.status}
        </span>
      ),
    },
  ];
}
