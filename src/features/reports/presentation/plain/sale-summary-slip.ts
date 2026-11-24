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
  return `Ks ${Number.isFinite(n) ? Math.round(n).toLocaleString("en-US") : "0"}`;
};

const quantity = (value: string | number) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return Number.isInteger(n) ? n.toLocaleString("en-US") : n.toFixed(2).replace(/\.?0+$/, "");
};

const dayMonthYear = (date: string) => date.split("-").reverse().join("-");

const twoDigits = (n: number) => String(n).padStart(2, "0");
const printedAt = (now: Date) =>
  `${twoDigits(now.getDate())}-${twoDigits(now.getMonth() + 1)}-${now.getFullYear()} ` +
  `${twoDigits(now.getHours())}:${twoDigits(now.getMinutes())}:${twoDigits(now.getSeconds())}`;

const slipLabel = (label: string) =>
  label.replace(/^Service charge \(/, "Service Charges(").replace(/^Tax \(/, "Tax(");

export function saleSummarySlipLines(
  report: SaleSummaryReport,
  scope: { outlet: string; printedBy: string | null; now?: Date },
): SlipLine[] {
  const s = report.sales;
  const row = (r: { label: string; count: number; amount: string }): SlipLine => ({
    kind: "row",
    label: slipLabel(r.label),
    count: r.count.toLocaleString("en-US"),
    amount: kyat(r.amount),
  });
  const plain = (label: string, amount: string): SlipLine => ({ kind: "row", label, count: "", amount });
  const total = (g: { count: number; amount: string }, label = "Total"): SlipLine => ({
    kind: "row",
    label,
    count: g.count.toLocaleString("en-US"),
    amount: kyat(g.amount),
  });
  const section = (text: string): SlipLine[] => [{ kind: "heading", text }, { kind: "rule" }];
  const drawer = report.cashDrawer;
  const period =
    report.from === report.to
      ? dayMonthYear(report.from)
      : `${dayMonthYear(report.from)} to ${dayMonthYear(report.to)}`;

  return [
    { kind: "title", text: report.shopName || scope.outlet },
    { kind: "center", text: "Sales Summary" },
    { kind: "center", text: period },
    ...(report.shopName && scope.outlet !== "All outlets" ? [{ kind: "center" as const, text: scope.outlet }] : []),
    { kind: "center", text: `Print: ${scope.printedBy ?? ""}|${printedAt(scope.now ?? new Date())}` },
    { kind: "rule" },
    ...section("Sales Summary"),
    plain("Settled Order", s.totalOrders.toLocaleString("en-US")),
    plain("Return quantity", quantity(s.returnQuantity)),
    { kind: "rule" },
    plain("Subtotal", kyat(s.subtotal.amount)),
    row(s.discount),
    row(s.promotion),
    plain(slipLabel(s.serviceCharge.label), kyat(s.serviceCharge.amount)),
    plain(slipLabel(s.tax.label), kyat(s.tax.amount)),
    ...(Number(s.tips.amount) > 0 ? [plain("Tips", kyat(s.tips.amount))] : []),
    row(s.refund),
    { kind: "rule" },
    plain("Total", kyat(s.total)),
    plain("Receivable", kyat(s.receivable)),
    { kind: "rule" },
    ...section("Payment Summary"),
    ...section("Receipts"),
    total(report.payments.receipts),
    { kind: "rule" },
    ...report.payments.receipts.rows.map(row),
    { kind: "rule" },
    ...section("Exclude Receipts"),
    total(report.payments.excluded),
    { kind: "rule" },
    ...report.payments.excluded.rows.map(row),
    { kind: "rule" },
    ...section("Cash Drawer Verification"),
    plain("Petty Cash", kyat(drawer.pettyCash)),
    plain("Order Revenue", kyat(drawer.orderRevenue)),
    ...(Number(drawer.cashRefunds) > 0 ? [plain("Cash Refunds", `-${kyat(drawer.cashRefunds)}`)] : []),
    { kind: "rule" },
    plain("Estimated Amount", kyat(drawer.estimated)),
    { kind: "rule" },
    ...section("Category Summary"),
    { kind: "row", label: "Total", count: quantity(report.categories.quantity), amount: kyat(report.categories.amount) },
    { kind: "rule" },
    ...report.categories.rows.map(
      (r): SlipLine => ({ kind: "row", label: r.label, count: quantity(r.quantity), amount: kyat(r.amount) }),
    ),
    { kind: "rule" },
    ...section("Order Type"),
    total(report.orderTypes),
    { kind: "rule" },
    ...report.orderTypes.rows.map(row),
    { kind: "rule" },
  ];
}

/** One slip line in fixed columns: label, count, amount. A long label wraps. */
function rowText(line: Extract<SlipLine, { kind: "row" }>, width: number): string[] {
  const amountWidth = 14;
  const countWidth = 6;
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
      encoder.align("center").line(line.text).align("left");
      html.push(`<div class="heading">${escapeHtml(line.text)}</div>`);
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
  scope: { outlet: string; printedBy: string | null },
  options: { paperWidthMm: 58 | 80; mode: Required<ThermalPrintOptions>["mode"] },
): Promise<ThermalPrintResult> {
  const slip = buildSaleSummarySlip(saleSummarySlipLines(report, scope), options.paperWidthMm, true);
  const gateway = container.resolve<IThermalPrintGateway>("thermalPrintGateway");
  const resolved = { paperWidthMm: options.paperWidthMm, mode: options.mode, cut: true };
  return options.mode === "raw-escpos"
    ? gateway.printEscPos(slip.bytes, resolved)
    : gateway.printHtml(slip.html, resolved);
}
