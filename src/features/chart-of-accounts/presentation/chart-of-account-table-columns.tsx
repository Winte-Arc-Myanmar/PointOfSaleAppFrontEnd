import type { DataTableColumn } from "@/presentation/components/data-table";
import type { ChartOfAccount } from "@/core/domain/entities/ChartOfAccount";

export function getChartOfAccountTableColumns(): DataTableColumn<ChartOfAccount>[] {
  return [
    {
      key: "accountCode",
      header: "Code",
      sortable: true,
      className: "min-w-[120px]",
      render: (a) => (
        <span className="font-mono text-sm text-foreground">{a.accountCode}</span>
      ),
    },
    {
      key: "accountName",
      header: "Account Name",
      sortable: true,
      className: "min-w-[220px] max-w-[300px]",
      render: (a) => (
        <span className="font-medium text-foreground truncate" title={a.accountName}>
          {a.accountName}
        </span>
      ),
    },
    {
      key: "accountType",
      header: "Type",
      className: "min-w-[130px]",
      render: (a) => (
        <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground">
          {a.accountType}
        </span>
      ),
    },
    {
      key: "isReconcilable",
      header: "Reconcilable",
      className: "min-w-[120px]",
      render: (a) => (
        <span className={a.isReconcilable ? "text-green-600 font-medium" : "text-muted"}>
          {a.isReconcilable ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "tenantId",
      header: "Tenant ID",
      className: "min-w-[200px] max-w-[240px]",
      render: (a) => (
        <span className="font-mono text-xs text-muted truncate" title={a.tenantId}>
          {a.tenantId}
        </span>
      ),
    },
  ];
}

