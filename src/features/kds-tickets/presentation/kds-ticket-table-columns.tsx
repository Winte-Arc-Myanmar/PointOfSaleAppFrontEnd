import type { DataTableColumn } from "@/presentation/components/data-table";
import type { KdsTicket } from "@/core/domain/entities/KdsTicket";
import { StatusBadge } from "@/presentation/components/ui/status-badge";
import { cn } from "@/lib/utils";

/** An open ticket older than this is late. */
export const LATE_AFTER_MINUTES = 30;

export function isOpenTicket(t: KdsTicket): boolean {
  return t.status !== "READY";
}

function minutesSince(iso: string | null | undefined, now: number): number | null {
  if (!iso) return null;
  const at = new Date(iso).getTime();
  return Number.isFinite(at) ? Math.max(0, Math.floor((now - at) / 60000)) : null;
}

/** 45 min, 3 h, 12 d. */
function formatAge(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 48 * 60) return `${Math.floor(minutes / 60)} h`;
  return `${Math.floor(minutes / (24 * 60))} d`;
}

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
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: "stationId",
      header: "Station",
      className: "min-w-[180px]",
      render: (t) => stationLabelById[t.stationId] ?? t.stationName ?? "—",
    },
    {
      key: "sessionId",
      header: "For",
      className: "min-w-[180px]",
      render: (t) =>
        t.placeLabel ?? (t.sessionId ? sessionLabelById[t.sessionId] : undefined) ?? "—",
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
    {
      key: "age",
      header: "Waiting",
      className: "min-w-[100px]",
      render: (t) => {
        const minutes = minutesSince(t.firedAt, Date.now());
        if (minutes == null || !isOpenTicket(t)) return <span className="text-muted">—</span>;
        const late = minutes >= LATE_AFTER_MINUTES;
        return (
          <span className={cn("tabular-nums text-sm", late ? "font-semibold text-red-600 dark:text-red-400" : "text-muted")}>
            {formatAge(minutes)}
            {late ? " · late" : ""}
          </span>
        );
      },
    },
  ];
}
