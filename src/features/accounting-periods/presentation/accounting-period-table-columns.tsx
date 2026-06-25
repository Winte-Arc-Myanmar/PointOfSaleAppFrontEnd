import type { DataTableColumn } from "@/presentation/components/data-table";
import type { AccountingPeriod } from "@/core/domain/entities/AccountingPeriod";
import { formatDate } from "@/presentation/components/detail";

type AccountingPeriodTableColumnOptions = {
  onView?: (period: AccountingPeriod) => void;
};

function statusClassName(status: string): string {
  if (status === "OPEN") return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400";
  if (status === "CLOSED") return "border-border bg-muted text-muted-foreground";
  return "border-border bg-muted text-foreground";
}

export function getAccountingPeriodTableColumns(
  options: AccountingPeriodTableColumnOptions = {},
): DataTableColumn<AccountingPeriod>[] {
  const { onView } = options;

  return [
    {
      key: "periodName",
      header: "Period Name",
      sortable: true,
      className: "min-w-[180px] max-w-[260px]",
      render: (p) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={p.periodName}
            onClick={() => onView(p)}
          >
            {p.periodName}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate" title={p.periodName}>
            {p.periodName}
          </span>
        ),
    },
    {
      key: "startDate",
      header: "Start Date",
      sortable: true,
      className: "min-w-[130px]",
      render: (p) => (
        <span className="text-sm text-foreground">{formatDate(p.startDate)}</span>
      ),
    },
    {
      key: "endDate",
      header: "End Date",
      sortable: true,
      className: "min-w-[130px]",
      render: (p) => (
        <span className="text-sm text-foreground">{formatDate(p.endDate)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "min-w-[100px]",
      render: (p) => (
        <span
          className={`rounded-md border px-2 py-1 text-xs font-medium ${statusClassName(p.status)}`}
        >
          {p.status}
        </span>
      ),
    },
    {
      key: "tenantId",
      header: "Tenant ID",
      className: "min-w-[200px] max-w-[240px]",
      render: (p) => (
        <span className="font-mono text-xs text-muted truncate" title={p.tenantId}>
          {p.tenantId}
        </span>
      ),
    },
  ];
}
