import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Product } from "@/core/domain/entities/Product";

/**
 * Table column definitions for the products DataTable.
 * Keeps column config out of the list page; reuse or extend per page if needed.
 */
export function getProductTableColumns(): DataTableColumn<Product>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[120px] max-w-[200px]",
      render: (p) => (
        <span className="font-medium text-matte-white truncate" title={p.name}>
          {p.name}
        </span>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      className: "min-w-[80px] max-w-[140px]",
      render: (p) => (
        <span className="text-matte-white/80 truncate" title={p.sku}>
          {p.sku}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      className: "min-w-[80px] max-w-[120px]",
      render: (p) => (
        <span className="text-matte-white/80">
          {p.price.currency} {p.price.amount}
        </span>
      ),
    },
    {
      key: "quantityInStock",
      header: "Stock",
      sortable: true,
      className: "min-w-[70px] max-w-[90px]",
      render: (p) => (
        <span className="text-matte-white/80">{p.quantityInStock}</span>
      ),
    },
  ];
}
