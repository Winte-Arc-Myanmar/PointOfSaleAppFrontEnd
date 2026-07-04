import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Reservation } from "@/core/domain/entities/Reservation";

type ReservationTableColumnOptions = {
  onView?: (reservation: Reservation) => void;
  locationLabelById?: Record<string, string>;
  tableLabelById?: Record<string, string>;
};

function fmtDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function getReservationTableColumns(
  options: ReservationTableColumnOptions = {},
): DataTableColumn<Reservation>[] {
  const { onView, locationLabelById = {}, tableLabelById = {} } = options;
  return [
    {
      key: "guestName",
      header: "Guest",
      sortable: true,
      className: "min-w-[180px]",
      render: (r) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground hover:text-mint transition-colors"
            onClick={() => onView(r)}
          >
            {r.guestName}
          </button>
        ) : (
          <span className="font-medium text-foreground">{r.guestName}</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      className: "min-w-[120px]",
    },
    {
      key: "partySize",
      header: "Party",
      sortable: true,
      className: "min-w-[80px]",
      render: (r) => String(r.partySize),
    },
    {
      key: "reservedAt",
      header: "Reserved At",
      sortable: true,
      className: "min-w-[180px]",
      render: (r) => fmtDate(r.reservedAt),
    },
    {
      key: "locationId",
      header: "Location",
      className: "min-w-[160px]",
      render: (r) => locationLabelById[r.locationId] ?? r.locationId,
    },
    {
      key: "assignedTableId",
      header: "Assigned Table",
      className: "min-w-[140px]",
      render: (r) =>
        r.assignedTableId
          ? (tableLabelById[r.assignedTableId] ?? r.assignedTableId)
          : "-",
    },
  ];
}
