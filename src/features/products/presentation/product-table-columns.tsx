import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Product } from "@/core/domain/entities/Product";

type ProductTableColumnOptions = {
  onView?: (product: Product) => void;
};

export function getProductTableColumns(
  options: ProductTableColumnOptions = {},
): DataTableColumn<Product>[] {
  const { onView } = options;

  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[120px] max-w-[200px]",
      render: (p) => (
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={p.name}
            onClick={() => onView(p)}
          >
            {p.name}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate" title={p.name}>
            {p.name}
          </span>
        )
      ),
    },
    {
      key: "baseSku",
      header: "Base SKU",
      sortable: true,
      className: "min-w-[100px] max-w-[160px]",
      render: (p) => (
        <span className="text-muted truncate" title={p.baseSku}>
          {p.baseSku}
        </span>
      ),
    },
    {
      key: "basePrice",
      header: "Base price",
      className: "min-w-[80px] max-w-[120px]",
      render: (p) => (
        <span className="text-muted">
          {typeof p.basePrice === "number" ? p.basePrice : "—"}
        </span>
      ),
    },
    {
      key: "categoryName",
      header: "Category",
      className: "min-w-[100px] max-w-[160px]",
      render: (p) => (
        <span className="text-muted truncate" title={p.categoryName ?? ""}>
          {p.categoryName ?? "—"}
        </span>
      ),
    },
    {
      key: "baseUomName",
      header: "UOM",
      className: "min-w-[70px] max-w-[100px]",
      render: (p) => (
        <span className="text-muted">{p.baseUomName ?? "—"}</span>
      ),
    },
    {
      key: "trackingType",
      header: "Tracking",
      className: "min-w-[80px] max-w-[120px]",
      render: (p) => <span className="text-muted">{p.trackingType}</span>,
    },
    {
      key: "isTaxable",
      header: "Taxable",
      className: "min-w-[72px] max-w-[90px]",
      render: (p) => (
        <span className="text-muted">
          {p.isTaxable == null ? "—" : p.isTaxable ? "Yes" : "No"}
        </span>
      ),
    },
  ];
}
