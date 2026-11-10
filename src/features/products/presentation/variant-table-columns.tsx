import type { DataTableColumn } from "@/presentation/components/data-table";
import type { ProductVariant } from "@/core/domain/entities/ProductVariant";
import { formatMoney } from "@/lib/money";
import { variantName } from "./variant-name";

const signed = (value: number) =>
  `${value < 0 ? "−" : "+"}${formatMoney(Math.abs(value))}`;

export function getVariantTableColumns(
  basePrice: number,
): DataTableColumn<ProductVariant>[] {
  return [
    {
      key: "matrixOptions",
      header: "Name",
      className: "min-w-[140px] max-w-[240px]",
      render: (v) => (
        <span className="truncate font-medium text-foreground" title={variantName(v)}>
          {variantName(v)}
        </span>
      ),
    },
    {
      key: "priceModifier",
      header: "Extra price",
      className: "min-w-[100px] whitespace-nowrap",
      render: (v) => (
        <span className="tabular-nums text-muted">{signed(Number(v.priceModifier) || 0)}</span>
      ),
    },
    {
      key: "sellsAt",
      header: "Sells at",
      className: "min-w-[100px] whitespace-nowrap",
      render: (v) => (
        <span className="font-semibold tabular-nums text-foreground">
          {formatMoney(Number(basePrice || 0) + (Number(v.priceModifier) || 0))}
        </span>
      ),
    },
    {
      key: "variantSku",
      header: "SKU",
      className: "min-w-[120px] max-w-[200px]",
      render: (v) => (
        <span className="truncate font-mono text-xs text-muted" title={v.variantSku}>
          {v.variantSku}
        </span>
      ),
    },
    {
      key: "barcode",
      header: "Barcode",
      className: "hidden min-w-[100px] max-w-[160px] md:table-cell",
      render: (v) => <span className="text-muted">{v.barcode || "—"}</span>,
    },
  ];
}
