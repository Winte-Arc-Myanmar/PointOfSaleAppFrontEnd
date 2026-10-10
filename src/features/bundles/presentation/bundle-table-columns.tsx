import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Bundle } from "@/core/domain/entities/Bundle";

type BundleTableColumnOptions = {
  productNames?: Record<string, string>;
  onView?: (bundle: Bundle) => void;
};

export function getBundleTableColumns(
  options: BundleTableColumnOptions = {},
): DataTableColumn<Bundle>[] {
  const { onView, productNames = {} } = options;

  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[180px] max-w-[260px]",
      render: (b) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={b.name}
            onClick={() => onView(b)}
          >
            {b.name}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate" title={b.name}>
            {b.name}
          </span>
        ),
    },
    {
      key: "productId",
      header: "Product",
      className: "min-w-[220px] max-w-[280px]",
      render: (r) => productNames[r.productId] ?? "—",
    },
    {
      key: "components",
      header: "Components",
      className: "min-w-[100px]",
      render: (b) => <span>{b.components?.length ?? 0}</span>,
    },
    {
      key: "isActive",
      header: "Status",
      className: "min-w-[100px]",
      render: (b) => (
        <span className={b.isActive ? "text-green-600 font-medium" : "text-muted"}>
          {b.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      className: "min-w-[200px] max-w-[280px]",
      render: (b) => (
        <span className="text-muted truncate" title={b.description ?? undefined}>
          {b.description || "—"}
        </span>
      ),
    },
  ];
}
