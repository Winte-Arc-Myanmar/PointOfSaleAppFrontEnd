import type { DataTableColumn } from "@/presentation/components/data-table";
import type { KdsTicket } from "@/core/domain/entities/KdsTicket";

type KdsTicketTableColumnOptions = {
  onView?: (ticket: KdsTicket) => void;
  stationLabelById?: Record<string, string>;
  sessionLabelById?: Record<string, string>;
};

export function getKdsTicketTableColumns(
  options: KdsTicketTableColumnOptions = {},
): DataTableColumn<KdsTicket>[] {
  const { onView, stationLabelById = {}, sessionLabelById = {} } = options;

  return [
    {
      key: "ticketNumber",
      header: "Ticket #",
      sortable: true,
      className: "min-w-[170px]",
      render: (t) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground hover:text-mint transition-colors"
            onClick={() => onView(t)}
          >
            {t.ticketNumber}
          </button>
        ) : (
          <span className="font-medium text-foreground">{t.ticketNumber}</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      className: "min-w-[120px]",
      render: (t) => t.status,
    },
    {
      key: "stationId",
      header: "Station",
      className: "min-w-[180px]",
      render: (t) => stationLabelById[t.stationId] ?? t.stationId,
    },
    {
      key: "sessionId",
      header: "Session",
      className: "min-w-[180px]",
      render: (t) => (t.sessionId ? sessionLabelById[t.sessionId] ?? t.sessionId : "—"),
    },
    {
      key: "courseType",
      header: "Course",
      className: "min-w-[100px]",
      render: (t) => t.courseType || "—",
    },
    {
      key: "firedAt",
      header: "Fired at",
      sortable: true,
      className: "min-w-[170px]",
      render: (t) => (t.firedAt ? new Date(t.firedAt).toLocaleString() : "—"),
    },
  ];
}
