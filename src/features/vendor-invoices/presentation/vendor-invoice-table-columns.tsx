import type { DataTableColumn } from "@/presentation/components/data-table";
import type { VendorInvoice } from "@/core/domain/entities/VendorInvoice";

type VendorInvoiceTableColumnOptions = {
  onView?: (row: VendorInvoice) => void;
};

function statusClassName(status: string): string {
  if (status === "PAID")
    return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400";
  if (status === "PARTIAL")
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400";
  if (status === "VOID")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400";
  if (status === "UNPAID")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400";
  return "border-border bg-muted text-foreground";
}

export function getVendorInvoiceTableColumns(
  options: VendorInvoiceTableColumnOptions = {},
): DataTableColumn<VendorInvoice>[] {
  const { onView } = options;

  return [
    {
      key: "invoiceNumber",
      header: "Invoice Number",
      sortable: true,
      className: "min-w-[140px]",
      render: (row) =>
        onView ? (
          <button
            type="button"
            className="text-sm font-medium text-foreground hover:text-mint transition-colors"
            onClick={() => onView(row)}
          >
            {row.invoiceNumber}
          </button>
        ) : (
          <span className="text-sm font-medium text-foreground">{row.invoiceNumber}</span>
        ),
    },
    {
      key: "invoiceType",
      header: "Type",
      className: "min-w-[120px]",
      render: (row) => (
        <span className="text-sm text-foreground">{row.invoiceType}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "min-w-[110px]",
      render: (row) => (
        <span
          className={`rounded-md border px-2 py-1 text-xs font-medium ${statusClassName(row.status)}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "totalAmount",
      header: "Total",
      sortable: true,
      className: "min-w-[120px]",
      render: (row) => (
        <span className="font-mono text-sm font-medium text-foreground">
          {row.totalAmount}
        </span>
      ),
    },
    {
      key: "vendorId",
      header: "Vendor",
      className: "min-w-[160px] max-w-[200px]",
      render: (row) => (
        <span className="font-mono text-xs text-muted truncate" title={row.vendorId}>
          {row.vendorId}
        </span>
      ),
    },
  ];
}
