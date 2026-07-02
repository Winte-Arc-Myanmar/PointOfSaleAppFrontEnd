import type { DataTableColumn } from "@/presentation/components/data-table";
import type { KdsStation } from "@/core/domain/entities/KdsStation";

type KdsStationTableColumnOptions = {
  onView?: (station: KdsStation) => void;
  locationLabelById?: Record<string, string>;
};

export function getKdsStationTableColumns(
  options: KdsStationTableColumnOptions = {},
): DataTableColumn<KdsStation>[] {
  const { onView, locationLabelById = {} } = options;

  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[180px]",
      render: (s) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground hover:text-mint transition-colors"
            onClick={() => onView(s)}
          >
            {s.name}
          </button>
        ) : (
          <span className="font-medium text-foreground">{s.name}</span>
        ),
    },
    {
      key: "displayColor",
      header: "Color",
      className: "min-w-[120px]",
      render: (s) => (
        <div className="inline-flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full border border-border"
            style={{ backgroundColor: s.displayColor }}
          />
          <span className="font-mono text-xs text-muted">{s.displayColor}</span>
        </div>
      ),
    },
    {
      key: "routingRules",
      header: "Categories",
      className: "min-w-[100px]",
      render: (s) => String(s.routingRules.categoryIds.length),
    },
    {
      key: "locationId",
      header: "Location",
      className: "min-w-[180px]",
      render: (s) => locationLabelById[s.locationId] ?? s.locationId,
    },
  ];
}
