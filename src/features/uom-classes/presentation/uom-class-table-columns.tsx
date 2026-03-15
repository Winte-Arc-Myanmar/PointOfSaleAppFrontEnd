import type { DataTableColumn } from "@/presentation/components/data-table";
import type { UomClass } from "@/core/domain/entities/UomClass";

export function getUomClassTableColumns(): DataTableColumn<UomClass>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[120px] max-w-[200px]",
      render: (c) => (
        <span className="font-medium text-foreground truncate" title={c.name}>
          {c.name}
        </span>
      ),
    },
    {
      key: "tenantId",
      header: "Tenant ID",
      className: "min-w-[200px] max-w-[280px]",
      render: (c) => (
        <span className="font-mono text-xs text-muted truncate" title={c.tenantId}>
          {c.tenantId}
        </span>
      ),
    },
  ];
}
