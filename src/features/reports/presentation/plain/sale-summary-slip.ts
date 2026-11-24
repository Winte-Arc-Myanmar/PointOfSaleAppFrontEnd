import container from "@/core/infrastructure/di/container";
import { charsPerLine, EscPosEncoder } from "@/core/application/print/EscPosEncoder";
import type { ThermalPrintOptions, ThermalPrintResult } from "@/core/domain/entities/ThermalPrint";
import type { IThermalPrintGateway } from "@/core/domain/repositories/IThermalPrintGateway";
import type { SaleSummaryReport } from "@/presentation/hooks/useSaleSummaryReport";

type SlipLine =
  | { kind: "title"; text: string }
  | { kind: "center"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "row"; label: string; count: string; amount: string }
  | { kind: "rule" };

const kyat = (value: string | number) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n).toLocaleString("en-US") : "0";
};

const quantity = (value: string) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return Number.isInteger(n) ? n.toLocaleString("en-US") : n.toFixed(2).replace(/\.?0+$/, "");
};

export function saleSummarySlipLines(
  report: SaleSummaryReport,
  scope: { outlet: string; period: string },
): SlipLine[] {
  const s = report.sales;
  const row = (r: { label: string; count: number; amount: string }): SlipLine => ({
    kind: "row",
    label: r.label,
    count: r.count.toLocaleString("en-US"),
    amount: kyat(r.amount),
  });
  const salesRows = [s.subtotal, s.serviceCharge, s.tax, s.discount, s.promotion]
    .concat(Number(s.tips.amount) > 0 ? [s.tips] : [])
    .concat([s.refund]);

  return [
    { kind: "title", text: "SALE SUMMARY REPORT" },
    { kind: "center", text: scope.outlet },
    { kind: "center", text: scope.period },
    { kind: "rule" },
    { kind: "heading", text: "Sale Summary" },
    ...salesRows.map(row),
    { kind: "row", label: "Total Sales", count: "", amount: kyat(s.totalSales) },
    { kind: "row", label: "Total Sale Orders", count: "", amount: s.totalOrders.toLocaleString("en-US") },
    { kind: "rule" },
    { kind: "heading", text: "Payment Summary" },
    ...report.payments.rows.map(row),
    {
      kind: "row",
      label: "Total Sales",
      count: report.payments.count.toLocaleString("en-US"),
      amount: kyat(report.payments.amount),
    },
    { kind: "rule" },
    { kind: "heading", text: "Category Summary" },
    ...report.categories.rows.map(
      (r): SlipLine => ({ kind: "row", label: r.label, count: quantity(r.quantity), amount: kyat(r.amount) }),
    ),
    { kind: "rule" },
    { kind: "heading", text: "Sale Orders Summary" },
    ...report.orderTypes.rows.map(row),
    {
      kind: "row",
      label: "Total Orders",
      count: report.orderTypes.count.toLocaleString("en-US"),
      amount: kyat(report.orderTypes.amount),
    },
    { kind: "rule" },
  ];
}

/** One slip line in fixed columns: label, count, amount. A long label wraps. */
function rowText(line: Extract<SlipLine, { kind: "row" }>, width: number): string[] {
  const amountWidth = 11;
  const countWidth = 5;
  const labelWidth = width - amountWidth - countWidth;
  const tail = line.count.padStart(countWidth) + line.amount.padStart(amountWidth);
  const words = line.label.split(/\s+/);
  const labels: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > labelWidth - 1 && current) {
      labels.push(current);
      current = word;
    } else current = next;
  }
  labels.push(current);
  return labels.map((label, index) =>
    index === labels.length - 1
      ? label.slice(0, labelWidth).padEnd(labelWidth) + tail
      : label.slice(0, width),
  );
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildSaleSummarySlip(
  lines: SlipLine[],
  paperWidthMm: 58 | 80,
  cut: boolean,
): { bytes: Uint8Array; html: string } {
  const width = charsPerLine(paperWidthMm);
  const encoder = new EscPosEncoder().initialize().bold(true);
  const html: string[] = [];

  for (const line of lines) {
    if (line.kind === "rule") {
      encoder.align("left").line("-".repeat(width));
      html.push(`<div class="rule">${"-".repeat(width)}</div>`);
    } else if (line.kind === "title") {
      encoder.align("center").size(1, 2).line(line.text).size(1, 1).align("left");
      html.push(`<div class="title">${escapeHtml(line.text)}</div>`);
    } else if (line.kind === "center") {
      encoder.align("center").line(line.text.slice(0, width)).align("left");
      html.push(`<div class="center">${escapeHtml(line.text)}</div>`);
    } else if (line.kind === "heading") {
      encoder.align("left").line(line.text);
      html.push(`<div class="heading">${escapeHtml(line.text.padEnd(width))}</div>`);
    } else {
      const texts = rowText(line, width);
      for (const text of texts) {
        encoder.line(text);
        html.push(`<div class="line">${escapeHtml(text)}</div>`);
      }
    }
  }
  encoder.newline(3);
  if (cut) encoder.cut();

  const widthCss = paperWidthMm === 58 ? "58mm" : "80mm";
  const document = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Sale Summary Report</title>
  <style>
    @page { size: ${widthCss} auto; margin: 0; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
    }
    body {
      width: ${widthCss};
      font-family: "Courier New", Courier, monospace;
      font-size: 12px;
      font-weight: 900;
      line-height: 1.35;
      padding: 2mm 3mm 6mm;
      box-sizing: border-box;
    }
    .line, .heading {
      white-space: pre;
      font-weight: 900;
      text-align: center;
    }
    .title {
      font-size: 14px;
      line-height: 1.25;
      text-align: center;
    }
    .rule {
      margin: 2mm 0 1mm;
      overflow: hidden;
      white-space: nowrap;
      font-weight: 900;
      text-align: center;
    }
    .center { text-align: center; }
  </style>
</head>
<body>${html.join("")}</body>
</html>`;

  return { bytes: encoder.encode(), html: document };
}

export async function printSaleSummarySlip(
  report: SaleSummaryReport,
  scope: { outlet: string; period: string },
  options: { paperWidthMm: 58 | 80; mode: Required<ThermalPrintOptions>["mode"] },
): Promise<ThermalPrintResult> {
  const slip = buildSaleSummarySlip(saleSummarySlipLines(report, scope), options.paperWidthMm, true);
  const gateway = container.resolve<IThermalPrintGateway>("thermalPrintGateway");
  const resolved = { paperWidthMm: options.paperWidthMm, mode: options.mode, cut: true };
  return options.mode === "raw-escpos"
    ? gateway.printEscPos(slip.bytes, resolved)
    : gateway.printHtml(slip.html, resolved);
}
