import type { DataTableColumn } from "@/presentation/components/data-table";
import type { CustomerInteraction } from "@/core/domain/entities/CustomerInteraction";

export function getCustomerInteractionTableColumns(): DataTableColumn<CustomerInteraction>[] {
  return [
    {
      key: "interactionDate",
      header: "Date",
      sortable: true,
      className: "min-w-[140px] max-w-[180px]",
      render: (row) => (
        <span className="text-xs text-muted truncate" title={row.interactionDate ?? ""}>
          {row.interactionDate
            ? new Date(row.interactionDate).toLocaleString()
            : "—"}
        </span>
      ),
    },
    {
      key: "interactionChannel",
      header: "Channel",
      className: "min-w-[100px]",
      render: (row) => (
        <span className="text-sm font-medium">{row.interactionChannel}</span>
      ),
    },
    {
      key: "interactionType",
      header: "Type",
      className: "min-w-[100px]",
      render: (row) => (
        <span className="text-sm text-foreground">{row.interactionType}</span>
      ),
    },
    {
      key: "summary",
      header: "Summary",
      className: "min-w-[200px] max-w-[320px]",
      render: (row) => (
        <span className="text-sm text-muted truncate" title={row.summary}>
          {row.summary}
        </span>
      ),
    },
    {
      key: "agentId",
      header: "Agent",
      className: "min-w-[160px] max-w-[220px]",
      render: (row) => (
        <span
          className="font-mono text-xs text-muted truncate"
          title={row.agentId}
        >
          {row.agentId}
        </span>
      ),
    },
  ];
}
