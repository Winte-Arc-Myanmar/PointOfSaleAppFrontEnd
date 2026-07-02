import type { DataTableColumn } from "@/presentation/components/data-table";
import type { DiningZone } from "@/core/domain/entities/DiningZone";

type DiningZoneTableColumnOptions = {
  onView?: (zone: DiningZone) => void;
};

export function getDiningZoneTableColumns(
  options: DiningZoneTableColumnOptions = {}
): DataTableColumn<DiningZone>[] {
  const { onView } = options;

  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[180px] max-w-[260px]",
      render: (z) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={z.name}
            onClick={() => onView(z)}
          >
            {z.name}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate" title={z.name}>
            {z.name}
          </span>
        ),
    },
    {
      key: "sortOrder",
      header: "Sort Order",
      sortable: true,
      className: "min-w-[100px]",
      render: (z) => <span className="text-sm text-foreground">{z.sortOrder}</span>,
    },
    {
      key: "layoutSvg",
      header: "Layout",
      className: "min-w-[120px]",
      render: (z) => (
        <span className="text-xs text-muted">{z.layoutSvg ? "SVG defined" : "—"}</span>
      ),
    },
    {
      key: "tenantId",
      header: "Tenant ID",
      className: "min-w-[200px] max-w-[240px]",
      render: (z) => (
        <span className="font-mono text-xs text-muted truncate" title={z.tenantId}>
          {z.tenantId}
        </span>
      ),
    },
  ];
}
