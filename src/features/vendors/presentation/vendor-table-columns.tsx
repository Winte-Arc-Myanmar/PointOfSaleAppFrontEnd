import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Vendor } from "@/core/domain/entities/Vendor";

type VendorTableColumnOptions = {
  onView?: (vendor: Vendor) => void;
};

export function getVendorTableColumns(
  options: VendorTableColumnOptions = {},
): DataTableColumn<Vendor>[] {
  const { onView } = options;

  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[140px] max-w-[240px]",
      render: (v) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={v.name}
            onClick={() => onView(v)}
          >
            {v.name}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate" title={v.name}>
            {v.name}
          </span>
        ),
    },
    {
      key: "tenantId",
      header: "Tenant ID",
      className: "min-w-[200px] max-w-[280px]",
      render: (v) => (
        <span
          className="font-mono text-xs text-muted truncate"
          title={v.tenantId}
        >
          {v.tenantId}
        </span>
      ),
    },
  ];
}

