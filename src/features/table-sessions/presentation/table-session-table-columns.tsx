import type { DataTableColumn } from "@/presentation/components/data-table";
import type { TableSession } from "@/core/domain/entities/TableSession";

type TableSessionTableColumnOptions = {
  onView?: (session: TableSession) => void;
  tableLabelById?: Record<string, string>;
  waiterLabelById?: Record<string, string>;
};

export function getTableSessionTableColumns(
  options: TableSessionTableColumnOptions = {},
): DataTableColumn<TableSession>[] {
  const { onView, tableLabelById = {}, waiterLabelById = {} } = options;

  return [
    {
      key: "sessionState",
      header: "State",
      sortable: true,
      className: "min-w-[130px]",
      render: (s) =>
        onView ? (
          <button
            type="button"
            className="text-left font-medium text-foreground hover:text-mint transition-colors"
            onClick={() => onView(s)}
          >
            {s.sessionState}
          </button>
        ) : (
          <span className="font-medium text-foreground">{s.sessionState}</span>
        ),
    },
    {
      key: "tableId",
      header: "Table",
      className: "min-w-[160px]",
      render: (s) => tableLabelById[s.tableId] ?? s.tableId,
    },
    {
      key: "waiterId",
      header: "Waiter",
      className: "min-w-[180px]",
      render: (s) => waiterLabelById[s.waiterId] ?? s.waiterId,
    },
    {
      key: "guestCount",
      header: "Guests",
      className: "min-w-[90px]",
      render: (s) => String(s.guestCount),
    },
    {
      key: "openedAt",
      header: "Opened",
      sortable: true,
      className: "min-w-[170px]",
      render: (s) => (s.openedAt ? new Date(s.openedAt).toLocaleString() : "—"),
    },
    {
      key: "closedAt",
      header: "Closed",
      className: "min-w-[170px]",
      render: (s) => (s.closedAt ? new Date(s.closedAt).toLocaleString() : "Open"),
    },
  ];
}
