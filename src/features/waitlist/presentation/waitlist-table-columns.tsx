import type { WaitlistEntry } from "@/core/domain/entities/Waitlist";
import type { DataTableColumn } from "@/presentation/components/data-table";

type WaitlistTableColumnOptions = {
  onView?: (entry: WaitlistEntry) => void;
  locationLabelById?: Record<string, string>;
  tableLabelById?: Record<string, string>;
};

function fmtDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function getWaitlistTableColumns(
  options: WaitlistTableColumnOptions = {},
): DataTableColumn<WaitlistEntry>[] {
  const { onView, locationLabelById = {}, tableLabelById = {} } = options;
  return [
    {
      key: "guestName",
      header: "Guest",
      sortable: true,
      className: "min-w-[180px]",
      render: (entry) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground hover:text-mint transition-colors"
            onClick={() => onView(entry)}
          >
            {entry.guestName}
          </button>
        ) : (
          <span className="font-medium text-foreground">{entry.guestName}</span>
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
      className: "min-w-[90px]",
      render: (entry) => String(entry.partySize),
    },
    {
      key: "joinedAt",
      header: "Joined At",
      sortable: true,
      className: "min-w-[180px]",
      render: (entry) => fmtDate(entry.joinedAt),
    },
    {
      key: "locationId",
      header: "Location",
      className: "min-w-[160px]",
      render: (entry) => locationLabelById[entry.locationId] ?? entry.locationId,
    },
    {
      key: "assignedTableId",
      header: "Assigned Table",
      className: "min-w-[140px]",
      render: (entry) =>
        entry.assignedTableId
          ? (tableLabelById[entry.assignedTableId] ?? entry.assignedTableId)
          : "-",
    },
  ];
}
