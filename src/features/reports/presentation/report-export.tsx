"use client";

import {
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { DataTable, type DataTableColumn, type DataTableProps } from "@/presentation/components/data-table";
import { DetailRows, type DetailRowItem } from "@/presentation/components/detail";
import { useToast } from "@/presentation/providers/ToastProvider";

/** What the report covers, printed at the top of every export. */
export interface ReportScope {
  outlet: string;
  period: string;
  /** Short and file-name safe, e.g. 2026-10-01-to-2026-10-11. */
  fileSuffix: string;
}

type Facts = { kind: "facts"; title: string; rows: [string, string][] };
type Table = {
  kind: "table";
  title: string;
  headers: string[];
  rows: string[][];
  loadAll?: () => Promise<string[][]>;
};
type Part = Facts | Table;

const ScopeContext = createContext<ReportScope | null>(null);
const PartsContext = createContext<Map<string, Part> | null>(null);
const SectionContext = createContext<string | null>(null);

export const ReportScopeProvider = ScopeContext.Provider;
export const ReportSectionTitle = SectionContext.Provider;

export function useReportParts() {
  const [parts] = useState(() => new Map<string, Part>());
  return parts;
}
export const ReportPartsProvider = PartsContext.Provider;

/** Keeps a part in its panel's export, in the order the parts appear on screen. */
function usePart(part: Part) {
  const parts = useContext(PartsContext);
  const id = useId();
  useEffect(() => {
    parts?.set(id, part);
  });
  useEffect(
    () => () => {
      parts?.delete(id);
    },
    [parts, id],
  );
}

/** The text a cell shows on screen, read from what its column renders. */
export function cellText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(cellText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return cellText(node.props.children);
  return "";
}

const DEFAULT_SECTION = "Summary";

/** A summary figure, kept for the export as well as shown. */
export function useReportFact(label: string, value: string) {
  const section = useContext(SectionContext);
  usePart({ kind: "facts", title: section ?? DEFAULT_SECTION, rows: [[label, value]] });
}

export function ReportRows({ rows }: { rows: DetailRowItem[] }) {
  const section = useContext(SectionContext);
  usePart({
    kind: "facts",
    title: section ?? DEFAULT_SECTION,
    rows: rows.map((row) => [row.label, cellText(row.value)]),
  });
  return <DetailRows rows={rows} />;
}

function textRows<T>(columns: DataTableColumn<T>[], rows: T[]): string[][] {
  return rows.map((row) =>
    columns.map((column) =>
      cellText(column.render ? column.render(row) : (row as Record<string, ReactNode>)[column.key]),
    ),
  );
}

/**
 * A report table whose rows go to the export too: every row, not only the page
 * on screen. A table paged by the server passes loadAll to fetch the rest.
 */
export function ReportTable<T extends { id: string | number }>({
  title,
  loadAll,
  ...props
}: DataTableProps<T> & { title?: string; loadAll?: () => Promise<T[]> }) {
  const section = useContext(SectionContext);
  usePart({
    kind: "table",
    title: title ?? section ?? "Rows",
    headers: props.columns.map((column) => column.header),
    rows: textRows(props.columns, props.data),
    loadAll: loadAll && (async () => textRows(props.columns, await loadAll())),
  });
  return <DataTable {...props} />;
}

/** Fetches every page of a paged report, at most 500 rows a request. */
export async function allPages<T>(
  fetch: (page: number) => Promise<{ rows: T[]; totalPages: number }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let page = 1; ; page++) {
    const result = await fetch(page);
    rows.push(...result.rows);
    if (page >= result.totalPages) return rows;
  }
}

type Value = { text: string; number?: number; format?: "money" | "usd" | "share" | "count" };

const MONEY = /^-?[\d,]+(\.\d+)? MMK$/;
const USD = /^-?\$[\d,]+(\.\d+)?$/;
const SHARE = /^-?\d+(\.\d+)?%$/;
const COUNT = /^-?(0|[1-9][\d,]*)(\.\d+)?$/;

/** Formatted figures go back to numbers so Excel can add them up. */
function parseValue(text: string): Value {
  const t = text.trim();
  const n = (s: string) => Number(s.replace(/[^\d.-]/g, ""));
  if (MONEY.test(t)) return { text: t, number: n(t), format: "money" };
  if (USD.test(t)) return { text: t, number: n(t), format: "usd" };
  if (SHARE.test(t)) return { text: t, number: n(t) / 100, format: "share" };
  if (COUNT.test(t)) return { text: t, number: n(t), format: "count" };
  return { text: t === "—" ? "" : t };
}

const NUMBER_FORMAT = { money: "#,##0.##", usd: '"$"#,##0.00', share: "0.00%", count: "#,##0.##" };

async function collect(parts: Map<string, Part>): Promise<Part[]> {
  const merged: Part[] = [];
  for (const part of parts.values()) {
    const last = merged[merged.length - 1];
    if (part.kind === "facts" && last?.kind === "facts" && last.title === part.title) {
      last.rows.push(...part.rows);
    } else if (part.kind === "facts") {
      merged.push({ ...part, rows: [...part.rows] });
    } else {
      merged.push({ ...part, rows: part.loadAll ? await part.loadAll() : part.rows });
    }
  }
  return merged;
}

function sheetName(title: string, used: Set<string>): string {
  const base = title.replace(/[\\/?*[\]:]/g, " ").slice(0, 28) || "Sheet";
  let name = base;
  for (let i = 2; used.has(name.toLowerCase()); i++) name = `${base} ${i}`;
  used.add(name.toLowerCase());
  return name;
}

async function downloadExcel(fileName: string, title: string, scope: ReportScope, parts: Part[]) {
  const { default: ExcelJS } = await import("exceljs");
  const book = new ExcelJS.Workbook();
  const used = new Set<string>();
  for (const part of parts) {
    const sheet = book.addWorksheet(sheetName(part.title, used));
    sheet.addRow([title]).font = { bold: true, size: 14 };
    sheet.addRow([`${scope.outlet} · ${scope.period}`]);
    sheet.addRow([part.title]).font = { bold: true };
    const headers = part.kind === "facts" ? ["Item", "Value"] : part.headers;
    const rows = part.rows;
    sheet.addRow(headers).font = { bold: true };
    for (const row of rows) {
      const values = row.map(parseValue);
      const added = sheet.addRow(values.map((v) => v.number ?? v.text));
      values.forEach((v, i) => {
        if (v.format) added.getCell(i + 1).numFmt = NUMBER_FORMAT[v.format];
      });
    }
    headers.forEach((header, i) => {
      const width = Math.max(header.length, ...rows.map((row) => (row[i] ?? "").length));
      sheet.getColumn(i + 1).width = Math.min(Math.max(width + 2, 10), 60);
    });
  }
  const buffer = await book.xlsx.writeBuffer();
  const url = URL.createObjectURL(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function tableHtml(headers: string[], rows: string[][]): string {
  const numeric = headers.map((_, i) => rows.length > 0 && rows.every((row) => parseValue(row[i] ?? "").number !== undefined || !row[i] || row[i] === "—"));
  const cell = (tag: string, text: string, i: number) =>
    `<${tag}${numeric[i] ? ' class="num"' : ""}>${escape(text)}</${tag}>`;
  return `<table><thead><tr>${headers.map((h, i) => cell("th", h, i)).join("")}</tr></thead><tbody>${
    rows.length
      ? rows.map((row) => `<tr>${row.map((c, i) => cell("td", c, i)).join("")}</tr>`).join("")
      : `<tr><td colspan="${headers.length}" class="empty">Nothing in this range.</td></tr>`
  }</tbody></table>`;
}

/** Prints a clean copy of the report; the print dialog saves it as a PDF. */
function printPdf(fileName: string, title: string, scope: ReportScope, parts: Part[]) {
  const body = parts
    .map((part) =>
      part.kind === "facts"
        ? `<h2>${escape(part.title)}</h2><table class="facts"><tbody>${part.rows
            .map(([label, value]) => `<tr><th>${escape(label)}</th><td class="num">${escape(value)}</td></tr>`)
            .join("")}</tbody></table>`
        : `<h2>${escape(part.title)}</h2>${tableHtml(part.headers, part.rows)}`,
    )
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escape(fileName)}</title><style>
    @page { size: A4 landscape; margin: 12mm; }
    body { font-family: system-ui, "Noto Sans Myanmar", "Myanmar Text", sans-serif; color: #111; font-size: 10pt; }
    h1 { font-size: 16pt; margin: 0 0 2pt; }
    .scope { color: #555; margin: 0 0 12pt; }
    h2 { font-size: 11pt; margin: 14pt 0 4pt; }
    table { border-collapse: collapse; width: 100%; page-break-inside: auto; }
    table.facts { width: auto; min-width: 50%; }
    tr { page-break-inside: avoid; }
    th, td { border: 1px solid #ccc; padding: 3pt 5pt; text-align: left; vertical-align: top; }
    thead th { background: #f1f5f9; }
    table.facts th { background: #f8fafc; font-weight: 500; }
    .num { text-align: right; white-space: nowrap; }
    .empty { color: #777; text-align: center; }
  </style></head><body><h1>${escape(title)}</h1><p class="scope">${escape(scope.outlet)} · ${escape(
    scope.period,
  )}</p>${body}</body></html>`;

  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc || !frame.contentWindow) return;
  doc.open();
  doc.write(html);
  doc.close();
  frame.contentWindow.addEventListener("afterprint", () => frame.remove());
  setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
  }, 100);
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Excel and PDF buttons for one report panel; shown only on the Reports page. */
export function ReportExportButtons({
  title,
  parts,
  disabled,
}: {
  title: string;
  parts: Map<string, Part>;
  disabled?: boolean;
}) {
  const scope = useContext(ScopeContext);
  const toast = useToast();
  const [busy, setBusy] = useState<"excel" | "pdf" | null>(null);
  if (!scope) return null;
  const fileName = `${slug(title)}-${scope.fileSuffix}`;

  const run = async (kind: "excel" | "pdf") => {
    setBusy(kind);
    try {
      const collected = await collect(parts);
      if (kind === "excel") await downloadExcel(fileName, title, scope, collected);
      else printPdf(fileName, title, scope, collected);
    } catch {
      toast.error(kind === "excel" ? "Couldn't make the Excel file." : "Couldn't make the PDF.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || busy !== null}
        onClick={() => void run("excel")}
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        {busy === "excel" ? "Exporting..." : "Excel"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || busy !== null}
        title="Opens the print window. Choose Save as PDF."
        onClick={() => void run("pdf")}
      >
        <FileText className="mr-2 h-4 w-4" />
        {busy === "pdf" ? "Preparing..." : "PDF"}
      </Button>
    </>
  );
}
