import { Download } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import type { DataTableColumn } from "@/presentation/components/data-table";
import { formatMoney, formatQuantity, formatShare } from "@/features/reports/presentation/report-utils";

type Format = "money" | "quantity" | "share" | "text";

/** One column, shown in the table and written to the Excel export the same way. */
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

const csvCell = (value: string | number | null) => {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** A sheet for the export: a title row, then the columns and their rows. */
export interface ExportSheet<T> {
  title: string;
  columns: ReportColumn<T>[];
  rows: T[];
}

/**
 * Saves the report as a CSV that Excel opens directly. The byte-order mark makes
 * Excel read it as UTF-8, so Myanmar names come through intact.
 */
export function downloadCsv(fileName: string, sheets: ExportSheet<never>[]) {
  const lines: string[] = [];
  for (const sheet of sheets) {
    if (lines.length) lines.push("");
    lines.push(csvCell(sheet.title));
    lines.push(sheet.columns.map((c) => csvCell(c.header)).join(","));
    for (const row of sheet.rows) {
      lines.push(
        sheet.columns
          .map((c) => {
            const value = c.value(row);
            return csvCell(c.format && c.format !== "text" && value != null ? Number(value) : value);
          })
          .join(","),
      );
    }
  }
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function sheet<T>(title: string, columns: ReportColumn<T>[], rows: T[]): ExportSheet<never> {
  return { title, columns, rows } as unknown as ExportSheet<never>;
}

export function ExportButton({
  onClick,
  disabled,
  busy,
}: {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} disabled={disabled || busy}>
      <Download className="mr-2 h-4 w-4" />
      {busy ? "Exporting..." : "Export to Excel"}
    </Button>
  );
}
