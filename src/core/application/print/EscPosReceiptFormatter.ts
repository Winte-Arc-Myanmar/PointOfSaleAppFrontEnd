import type { Receipt } from "@/core/domain/entities/Receipt";
import type {
  DailySalesSummary,
  ZReport,
} from "@/core/domain/entities/Report";
import type {
  OrderSlip,
  ThermalPrintOptions,
} from "@/core/domain/entities/ThermalPrint";
import type { IThermalReceiptFormatter } from "@/core/domain/repositories/IThermalPrintGateway";
import type { ReportPrintContext } from "@/core/domain/services/IThermalPrintService";
import {
  EscPosEncoder,
  charsPerLine,
  money,
  padLine,
  wrapText,
} from "@/core/application/print/EscPosEncoder";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDateTime(value?: string): string {
  if (!value) return new Date().toLocaleString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

function joinAddress(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(", ");
}

function centerText(value: string, width: number): string {
  const text = value.length > width ? value.slice(0, width) : value;
  const left = Math.max(0, Math.floor((width - text.length) / 2));
  return `${" ".repeat(left)}${text}`;
}

function centerCell(value: string, width: number): string {
  const text = value.length > width ? value.slice(0, width) : value;
  const left = Math.max(0, Math.floor((width - text.length) / 2));
  const right = Math.max(0, width - text.length - left);
  return `${" ".repeat(left)}${text}${" ".repeat(right)}`;
}

function toHtmlDocument(lines: string[], paperWidthMm: 58 | 80): string {
  const widthCss = paperWidthMm === 58 ? "58mm" : "80mm";
  const body = lines
    .map((line) => {
      if (!line.trim()) return "<div class=\"spacer\"></div>";
      if (/^[=\-*]{8,}$/.test(line.trim())) {
        return `<div class="rule">${escapeHtml(line)}</div>`;
      }
      if (/^(KITCHEN ORDER|PAID RECEIPT|ORDER READY|TOTAL|THANK YOU!)/.test(line)) {
        return `<div class="line strong">${escapeHtml(line)}</div>`;
      }
      return `<div class="line">${escapeHtml(line)}</div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Thermal Receipt</title>
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
    .line {
      white-space: pre-wrap;
      word-break: break-word;
      font-weight: 900;
      text-align: center;
    }
    .strong {
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
    .spacer { height: 2mm; }
    .center { text-align: center; }
    .bold { font-weight: 700; }
  </style>
</head>
<body>${body}</body>
</html>`;
}

export class EscPosReceiptFormatter implements IThermalReceiptFormatter {
  formatReceipt(
    receipt: Receipt,
    options: Required<ThermalPrintOptions>,
  ): { bytes: Uint8Array; html: string } {
    const width = charsPerLine(options.paperWidthMm);
    const textLines: string[] = [];
    const encoder = new EscPosEncoder().initialize().bold(true).align("center");

    const push = (line = "") => {
      textLines.push(line);
      encoder.align("center");
      encoder.line(line);
    };

    const pushCenter = (line: string, bold = false) => {
      textLines.push(line);
      encoder.align("center");
      if (bold) encoder.bold(true);
      encoder.line(line);
      if (bold) encoder.bold(true);
      encoder.align("center");
    };

    pushCenter("PAID RECEIPT", true);
    pushCenter(receipt.header.businessName || "Receipt", true);
    if (receipt.header.legalName) pushCenter(receipt.header.legalName);
    const address = joinAddress([
      receipt.header.address,
      receipt.header.city,
      receipt.header.state,
      receipt.header.zipCode,
    ]);
    if (address) {
      for (const line of wrapText(address, width)) pushCenter(line);
    }
    if (receipt.header.phone) pushCenter(`Tel: ${receipt.header.phone}`);
    push(("=").repeat(width));

    push(`Receipt: ${receipt.orderInfo.receiptNumber}`);
    push(`Order: ${receipt.orderInfo.orderNumber}`);
    push(`Date: ${formatDateTime(receipt.orderInfo.dateTime)}`);
    if (receipt.orderInfo.locationName) {
      push(`Loc: ${receipt.orderInfo.locationName}`);
    }
    if (receipt.orderInfo.salesChannel) {
      push(`Channel: ${receipt.orderInfo.salesChannel}`);
    }
    if (receipt.customer?.name) {
      push(`Guest: ${receipt.customer.name}`);
    }
    push(("-").repeat(width));
    const qtyWidth = 5;
    const amountWidth = options.paperWidthMm === 58 ? 8 : 10;
    const itemWidth = width - qtyWidth - amountWidth - 2;
    push(
      `${centerCell("QTY", qtyWidth)} ${centerCell("ITEM", itemWidth)} ${centerCell("AMOUNT", amountWidth)}`,
    );
    push(("-").repeat(width));

    for (const item of receipt.lineItems) {
      const itemLines = wrapText(item.productName.toUpperCase(), itemWidth);
      const qtyCell = centerCell(`${item.quantity}x`, qtyWidth);
      const amountCell = centerCell(money(item.lineTotal), amountWidth);
      push(
        `${qtyCell} ${centerCell(itemLines[0] ?? "", itemWidth)} ${amountCell}`,
      );
      for (const line of itemLines.slice(1)) {
        push(
          `${centerCell("", qtyWidth)} ${centerCell(line, itemWidth)} ${centerCell("", amountWidth)}`,
        );
      }
      push(`@ ${money(item.unitPrice)} each`);
      if (item.variantSku) push(`SKU ${item.variantSku}`);
      if (item.lineDiscount > 0) {
        push(`Discount -${money(item.lineDiscount)}`);
      }
    }

    push(("-").repeat(width));
    push(`Subtotal ${money(receipt.totals.subtotal)}`);
    if (receipt.totals.totalDiscount > 0) {
      push(`Discount -${money(receipt.totals.totalDiscount)}`);
    }
    for (const tax of receipt.taxSummary) {
      push(`${tax.taxName} ${tax.ratePercentage}% ${money(tax.taxAmount)}`);
    }
    if (receipt.taxSummary.length === 0 && receipt.totals.totalTax > 0) {
      push(`Tax ${money(receipt.totals.totalTax)}`);
    }
    push(("=").repeat(width));
    encoder.bold(true);
    const totalLine = `TOTAL ${money(receipt.totals.grandTotal)}`;
    textLines.push(totalLine);
    encoder.line(totalLine);
    encoder.bold(true);
    push(("=").repeat(width));

    for (const payment of receipt.paymentSummary.payments) {
      push(`${payment.methodName} ${money(payment.amount)}`);
    }
    push(`Paid ${money(receipt.paymentSummary.totalPaid)}`);
    if (receipt.paymentSummary.changeDue > 0) {
      push(`Change ${money(receipt.paymentSummary.changeDue)}`);
    }

    if (receipt.footer?.message) {
      push();
      for (const line of wrapText(receipt.footer.message, width)) {
        pushCenter(line);
      }
    }
    if (receipt.footer?.returnPolicy) {
      for (const line of wrapText(receipt.footer.returnPolicy, width)) {
        pushCenter(line);
      }
    }

    push();
    pushCenter("THANK YOU!", true);
    encoder.newline(2);
    if (options.cut) encoder.cut();

    return {
      bytes: encoder.encode(),
      html: toHtmlDocument(textLines, options.paperWidthMm),
    };
  }

  formatOrderSlip(
    slip: OrderSlip,
    options: Required<ThermalPrintOptions>,
  ): { bytes: Uint8Array; html: string } {
    const width = charsPerLine(options.paperWidthMm);
    const textLines: string[] = [];
    const encoder = new EscPosEncoder().initialize().bold(true).align("center");

    const push = (line = "") => {
      textLines.push(line);
      encoder.align("center");
      encoder.line(line);
    };
    const pushCenter = (line: string, bold = false) => {
      textLines.push(line);
      encoder.align("center");
      if (bold) encoder.bold(true);
      encoder.line(line);
      if (bold) encoder.bold(true);
      encoder.align("center");
    };

    pushCenter("KITCHEN ORDER", true);
    pushCenter(slip.businessName || "Vision AI POS");
    push(("=").repeat(width));
    if (slip.orderNumber) push(`ORDER ${slip.orderNumber}`);
    if (slip.orderType) push(`TYPE ${slip.orderType.toUpperCase()}`);
    if (slip.tableNumber) push(`TABLE ${slip.tableNumber}`);
    push(`TIME ${formatDateTime(slip.dateTime)}`);
    push(("=").repeat(width));
    const qtyWidth = 5;
    const itemWidth = width - qtyWidth - 1;
    push(`${centerCell("QTY", qtyWidth)} ${centerCell("ITEM", itemWidth)}`);
    push(("-").repeat(width));

    for (const item of slip.lines) {
      const itemLines = wrapText(item.name.toUpperCase(), itemWidth);
      push(
        `${centerCell(`${item.quantity}x`, qtyWidth)} ${centerCell(itemLines[0] ?? "", itemWidth)}`,
      );
      for (const line of itemLines.slice(1)) {
        push(`${centerCell("", qtyWidth)} ${centerCell(line, itemWidth)}`);
      }
      if (item.note) {
        for (const line of wrapText(`NOTE: ${item.note}`, width)) push(line);
      }
      push(("-").repeat(width));
    }

    pushCenter("ORDER READY", true);

    if (slip.footerMessage) {
      push();
      for (const line of wrapText(slip.footerMessage, width)) pushCenter(line);
    }

    encoder.newline(2);
    if (options.cut) encoder.cut();

    return {
      bytes: encoder.encode(),
      html: toHtmlDocument(textLines, options.paperWidthMm),
    };
  }

  formatZReport(
    report: ZReport,
    context: ReportPrintContext | undefined,
    options: Required<ThermalPrintOptions>,
  ): { bytes: Uint8Array; html: string } {
    const width = charsPerLine(options.paperWidthMm);
    const textLines: string[] = [];
    const encoder = new EscPosEncoder().initialize().bold(true);

    const push = (line = "") => {
      textLines.push(line);
      encoder.line(line);
    };
    const pushCenter = (line: string, bold = false) => {
      textLines.push(line);
      encoder.align("center");
      if (bold) encoder.bold(true);
      encoder.line(line);
      if (bold) encoder.bold(true);
      encoder.align("left");
    };

    pushCenter("Z-REPORT", true);
    pushCenter(context?.locationName || "Location");
    push(`Date: ${report.date}`);
    push(("-").repeat(width));
    push(padLine("Completed", String(report.orders.completed), width));
    push(padLine("Voided", String(report.orders.voided), width));
    push(padLine("Refunded", String(report.orders.refunded), width));
    push(("-").repeat(width));
    push(padLine("Subtotal", moneyStr(report.totals.subtotal), width));
    push(padLine("Discount", moneyStr(report.totals.totalDiscount), width));
    push(padLine("Tax", moneyStr(report.totals.totalTax), width));
    push(padLine("Tips", moneyStr(report.totals.tipAmount), width));
    push(padLine("Service", moneyStr(report.totals.serviceCharge), width));
    push(("=").repeat(width));
    encoder.bold(true);
    const totalLine = padLine("TOTAL", moneyStr(report.totals.grandTotal), width);
    textLines.push(totalLine);
    encoder.line(totalLine);
    encoder.bold(true);
    push(("=").repeat(width));

    if (report.payments.length > 0) {
      pushCenter("Payments");
      for (const payment of report.payments) {
        push(padLine(payment.method, moneyStr(payment.total), width));
        if (Number(payment.tip) > 0) {
          push(padLine("  Tip", moneyStr(payment.tip), width));
        }
      }
      push(("-").repeat(width));
    }

    if (report.topItems.length > 0) {
      pushCenter("Top items");
      for (const item of report.topItems) {
        push(padLine(qtyStr(item.quantitySold), moneyStr(item.totalRevenue), width));
        for (const line of wrapText(item.productName, width)) push(line);
      }
      push(("-").repeat(width));
    }

    if (report.byCategory.length > 0) {
      pushCenter("By category");
      for (const category of report.byCategory) {
        push(
          padLine(
            `${category.categoryName} (${category.orderCount})`,
            moneyStr(category.totalRevenue),
            width,
          ),
        );
      }
    }

    encoder.newline(2);
    if (options.cut) encoder.cut();

    return {
      bytes: encoder.encode(),
      html: toHtmlDocument(textLines, options.paperWidthMm),
    };
  }

  formatDailySales(
    summary: DailySalesSummary,
    context: ReportPrintContext | undefined,
    options: Required<ThermalPrintOptions>,
  ): { bytes: Uint8Array; html: string } {
    const width = charsPerLine(options.paperWidthMm);
    const textLines: string[] = [];
    const encoder = new EscPosEncoder().initialize().bold(true);

    const push = (line = "") => {
      textLines.push(line);
      encoder.line(line);
    };
    const pushCenter = (line: string, bold = false) => {
      textLines.push(line);
      encoder.align("center");
      if (bold) encoder.bold(true);
      encoder.line(line);
      if (bold) encoder.bold(true);
      encoder.align("left");
    };

    pushCenter("DAILY SALES", true);
    pushCenter(context?.locationName || "Location");
    push(`Date: ${summary.date}`);
    push(("-").repeat(width));
    push(padLine("Orders", String(summary.orderCount), width));
    push(padLine("Avg ticket", moneyStr(summary.averageTicket), width));
    push(padLine("Subtotal", moneyStr(summary.subtotal), width));
    push(padLine("Discount", moneyStr(summary.totalDiscount), width));
    push(padLine("Tax", moneyStr(summary.totalTax), width));
    push(padLine("Tips", moneyStr(summary.tipAmount), width));
    push(padLine("Service", moneyStr(summary.serviceCharge), width));
    push(("=").repeat(width));
    encoder.bold(true);
    const totalLine = padLine("TOTAL", moneyStr(summary.grandTotal), width);
    textLines.push(totalLine);
    encoder.line(totalLine);
    encoder.bold(true);
    push(("=").repeat(width));

    if (summary.paymentBreakdown.length > 0) {
      pushCenter("Payments");
      for (const payment of summary.paymentBreakdown) {
        push(padLine(payment.method, moneyStr(payment.total), width));
      }
    }

    encoder.newline(2);
    if (options.cut) encoder.cut();

    return {
      bytes: encoder.encode(),
      html: toHtmlDocument(textLines, options.paperWidthMm),
    };
  }
}

function moneyStr(value: string | number): string {
  const n = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function qtyStr(value: string | number): string {
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n)) return "0";
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}
