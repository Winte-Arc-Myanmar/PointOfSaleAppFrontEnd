import type { DataTableColumn } from "@/presentation/components/data-table";
import type { BankStatement } from "@/core/domain/entities/BankStatement";
import { formatDate } from "@/presentation/components/detail";

type BankStatementTableColumnOptions = {
  onView?: (statement: BankStatement) => void;
};

export function getBankStatementTableColumns(
  options: BankStatementTableColumnOptions = {},
): DataTableColumn<BankStatement>[] {
  const { onView } = options;

  return [
    {
      key: "statementDate",
      header: "Statement Date",
      sortable: true,
      className: "min-w-[130px]",
      render: (s) =>
        onView ? (
          <button
            type="button"
            className="text-sm text-foreground hover:text-mint transition-colors"
            onClick={() => onView(s)}
          >
            {formatDate(s.statementDate)}
          </button>
        ) : (
          <span className="text-sm text-foreground">{formatDate(s.statementDate)}</span>
        ),
    },
    {
      key: "openingBalance",
      header: "Opening",
      sortable: true,
      className: "min-w-[120px]",
      render: (s) => (
        <span className="font-mono text-sm text-foreground">{s.openingBalance}</span>
      ),
    },
    {
      key: "closingBalance",
      header: "Closing",
      sortable: true,
      className: "min-w-[120px]",
      render: (s) => (
        <span className="font-mono text-sm font-medium text-foreground">{s.closingBalance}</span>
      ),
    },
    {
      key: "glAccountId",
      header: "GL Account",
      className: "min-w-[200px] max-w-[240px]",
      render: (s) => (
        <span className="font-mono text-xs text-muted truncate" title={s.glAccountId}>
          {s.glAccountId}
        </span>
      ),
    },
    {
      key: "tenantId",
      header: "Tenant ID",
      className: "min-w-[200px] max-w-[240px]",
      render: (s) => (
        <span className="font-mono text-xs text-muted truncate" title={s.tenantId}>
          {s.tenantId}
        </span>
      ),
    },
  ];
}
