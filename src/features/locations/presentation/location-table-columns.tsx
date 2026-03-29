import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Location } from "@/core/domain/entities/Location";

export function getLocationTableColumns(): DataTableColumn<Location>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[140px] max-w-[220px]",
      render: (loc) => (
        <span className="font-medium text-foreground truncate" title={loc.name}>
          {loc.name}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      className: "min-w-[100px] max-w-[160px]",
      render: (loc) => (
        <span className="capitalize text-muted" title={loc.type}>
          {loc.type || "—"}
        </span>
      ),
    },
  ];
}
