import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Product } from "@/core/domain/entities/Product";

export function getProductTableColumns(): DataTableColumn<Product>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[120px] max-w-[200px]",
      render: (p) => (
        <span className="font-medium text-foreground truncate" title={p.name}>
          {p.name}
        </span>
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
  ];
}
