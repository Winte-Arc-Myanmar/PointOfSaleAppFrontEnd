import type { DataTableColumn } from "@/presentation/components/data-table";
import { formatMoney, formatQuantity, formatShare } from "@/features/reports/presentation/report-utils";

type Format = "money" | "quantity" | "share" | "text";

/** One column, shown in the table and written to the export the same way. */
export interface ReportColumn<T> {
  key: string;
  header: string;
  value: (row: T) => string | number | null;
  format?: Format;
}

const show = (value: string | number | null, format: Format = "text") => {
  if (value == null || value === "") return "—";
  if (format === "money") return formatMoney(value);
  if (format === "quantity") return formatQuantity(value);
  if (format === "share") return formatShare(value);
  return String(value);
};

export function tableColumns<T>(columns: ReportColumn<T>[]): DataTableColumn<T>[] {
  return columns.map((column) => ({
    key: column.key,
    header: column.header,
    className: column.format && column.format !== "text" ? "text-right" : undefined,
    render: (row: T) => show(column.value(row), column.format),
  }));
}
