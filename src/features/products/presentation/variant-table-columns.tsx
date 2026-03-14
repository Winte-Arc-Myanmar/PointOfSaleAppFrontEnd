import type { DataTableColumn } from "@/presentation/components/data-table";
import type { ProductVariant } from "@/core/domain/entities/ProductVariant";

export function getVariantTableColumns(): DataTableColumn<ProductVariant>[] {
  return [
    {
      key: "variantSku",
      header: "Variant SKU",
      sortable: true,
      className: "min-w-[140px] max-w-[220px]",
      render: (v) => (
        <span className="font-medium text-foreground truncate" title={v.variantSku}>
          {v.variantSku}
        </span>
      ),
    },
    {
      key: "matrixOptions",
      header: "Options",
      className: "min-w-[120px] max-w-[200px]",
      render: (v) => (
        <span className="text-muted truncate" title={JSON.stringify(v.matrixOptions)}>
          {Object.entries(v.matrixOptions ?? {})
            .map(([k, val]) => `${k}: ${val}`)
            .join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "barcode",
      header: "Barcode",
      className: "min-w-[100px] max-w-[160px]",
      render: (v) => (
        <span className="text-muted">{v.barcode ?? "—"}</span>
      ),
    },
    {
      key: "priceModifier",
      header: "Price modifier",
      className: "min-w-[80px] max-w-[120px]",
      render: (v) => (
        <span className="text-muted">{v.priceModifier}</span>
      ),
    },
  ];
}
