import type { TipPool } from "@/core/domain/entities/TipPool";
import type { DataTableColumn } from "@/presentation/components/data-table";

type TipPoolTableColumnOptions = {
  onView?: (pool: TipPool) => void;
  locationLabelById?: Record<string, string>;
};

function fmtDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function getTipPoolTableColumns(
  options: TipPoolTableColumnOptions = {},
): DataTableColumn<TipPool>[] {
  const { onView, locationLabelById = {} } = options;
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[180px]",
      render: (pool) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground hover:text-mint transition-colors"
            onClick={() => onView(pool)}
          >
            {pool.name}
          </button>
        ) : (
          <span className="font-medium text-foreground">{pool.name}</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      className: "min-w-[120px]",
    },
    {
      key: "distributionMethod",
      header: "Distribution",
      className: "min-w-[140px]",
    },
    {
      key: "periodStart",
      header: "Period Start",
      className: "min-w-[180px]",
      render: (pool) => fmtDate(pool.periodStart),
    },
    {
      key: "periodEnd",
      header: "Period End",
      className: "min-w-[180px]",
      render: (pool) => fmtDate(pool.periodEnd),
    },
    {
      key: "totalDistributable",
      header: "Distributable",
      className: "min-w-[130px]",
      render: (pool) => pool.totalDistributable,
    },
    {
      key: "locationId",
      header: "Location",
      className: "min-w-[150px]",
      render: (pool) => locationLabelById[pool.locationId] ?? pool.locationId,
    },
  ];
}
