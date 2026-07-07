import type { DataTableColumn } from "@/presentation/components/data-table";
import type { PricingSchedule } from "@/core/domain/entities/PricingSchedule";

const DAY_LABELS: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

type PricingScheduleTableColumnOptions = {
  onView?: (schedule: PricingSchedule) => void;
};

function formatDays(days: number[]) {
  if (!days.length) return "—";
  return days.map((d) => DAY_LABELS[d] ?? String(d)).join(", ");
}

export function getPricingScheduleTableColumns(
  options: PricingScheduleTableColumnOptions = {},
): DataTableColumn<PricingSchedule>[] {
  const { onView } = options;

  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[180px] max-w-[260px]",
      render: (s) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={s.name}
            onClick={() => onView(s)}
          >
            {s.name}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate" title={s.name}>
            {s.name}
          </span>
        ),
    },
    {
      key: "timeWindow",
      header: "Time window",
      className: "min-w-[140px]",
      render: (s) => (
        <span className="text-sm text-muted">
          {s.startTime} – {s.endTime}
        </span>
      ),
    },
    {
      key: "daysOfWeek",
      header: "Days",
      className: "min-w-[160px]",
      render: (s) => <span className="text-sm">{formatDays(s.daysOfWeek)}</span>,
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      className: "min-w-[90px]",
      render: (s) => <span>{s.priority}</span>,
    },
    {
      key: "rules",
      header: "Rules",
      className: "min-w-[80px]",
      render: (s) => <span>{s.rules?.length ?? 0}</span>,
    },
    {
      key: "isActive",
      header: "Status",
      className: "min-w-[100px]",
      render: (s) => (
        <span className={s.isActive ? "text-green-600 font-medium" : "text-muted"}>
          {s.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];
}
