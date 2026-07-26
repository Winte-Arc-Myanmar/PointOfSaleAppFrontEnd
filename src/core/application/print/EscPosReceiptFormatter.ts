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

function toHtmlDocument(
  lines: string[],
  paperWidthMm: 58 | 80,
): string {
  const widthCss = paperWidthMm === 58 ? "58mm" : "80mm";
  const body = lines
    .map((line) => {
      if (!line.trim()) return "<br />";
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
      line-height: 1.35;
      padding: 2mm 3mm 6mm;
      box-sizing: border-box;
    }
    .line {
      white-space: pre-wrap;
      word-break: break-word;
    }
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
    const encoder = new EscPosEncoder().initialize();

    const push = (line = "") => {
      textLines.push(line);
      encoder.line(line);
    };

    const pushCenter = (line: string, bold = false) => {
      textLines.push(line);
      encoder.align("center");
      if (bold) encoder.bold(true);
      encoder.line(line);
      if (bold) encoder.bold(false);
      encoder.align("left");
    };

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
    push(("-").repeat(width));

    push(`Receipt: ${receipt.orderInfo.receiptNumber}`);
    push(`Order:   ${receipt.orderInfo.orderNumber}`);
    push(`Date:    ${formatDateTime(receipt.orderInfo.dateTime)}`);
    if (receipt.orderInfo.locationName) {
      push(`Loc:     ${receipt.orderInfo.locationName}`);
    }
    if (receipt.orderInfo.salesChannel) {
      push(`Channel: ${receipt.orderInfo.salesChannel}`);
    }
    if (receipt.customer?.name) {
      push(`Guest:   ${receipt.customer.name}`);
    }
    push(("-").repeat(width));

    for (const item of receipt.lineItems) {
      const qtyPrice = `${item.quantity} x ${money(item.unitPrice)}`;
      push(padLine(qtyPrice, money(item.lineTotal), width));
      for (const line of wrapText(item.productName, width)) push(line);
      if (item.variantSku) push(`  SKU: ${item.variantSku}`);
      if (item.lineDiscount > 0) {
        push(padLine("  Discount", `-${money(item.lineDiscount)}`, width));
      }
    }

    push(("-").repeat(width));
    push(padLine("Subtotal", money(receipt.totals.subtotal), width));
    if (receipt.totals.totalDiscount > 0) {
      push(padLine("Discount", `-${money(receipt.totals.totalDiscount)}`, width));
    }
    for (const tax of receipt.taxSummary) {
      push(
        padLine(
          `${tax.taxName} ${tax.ratePercentage}%`,
          money(tax.taxAmount),
          width,
        ),
      );
    }
    if (receipt.taxSummary.length === 0 && receipt.totals.totalTax > 0) {
      push(padLine("Tax", money(receipt.totals.totalTax), width));
    }
    push(("=").repeat(width));
    encoder.bold(true);
    const totalLine = padLine("TOTAL", money(receipt.totals.grandTotal), width);
    textLines.push(totalLine);
    encoder.line(totalLine);
    encoder.bold(false);
    push(("=").repeat(width));

    for (const payment of receipt.paymentSummary.payments) {
      push(padLine(payment.methodName, money(payment.amount), width));
    }
    push(padLine("Paid", money(receipt.paymentSummary.totalPaid), width));
    if (receipt.paymentSummary.changeDue > 0) {
      push(padLine("Change", money(receipt.paymentSummary.changeDue), width));
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
    pushCenter("Thank you!");
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
    const encoder = new EscPosEncoder().initialize();

    const push = (line = "") => {
      textLines.push(line);
      encoder.line(line);
    };
    const pushCenter = (line: string, bold = false) => {
      textLines.push(line);
      encoder.align("center");
      if (bold) encoder.bold(true);
      encoder.line(line);
      if (bold) encoder.bold(false);
      encoder.align("left");
    };

    pushCenter(slip.title || "Order Slip", true);
    pushCenter(slip.businessName || "Vision AI POS");
    push(("-").repeat(width));
    if (slip.orderNumber) push(`Order: ${slip.orderNumber}`);
    if (slip.orderType) push(`Type:  ${slip.orderType}`);
    if (slip.tableNumber) push(`Table: ${slip.tableNumber}`);
    push(`Date:  ${formatDateTime(slip.dateTime)}`);
    push(("-").repeat(width));

    for (const item of slip.lines) {
      push(padLine(`${item.quantity} x ${money(item.unitPrice)}`, money(item.lineTotal), width));
      for (const line of wrapText(item.name, width)) push(line);
      if (item.note) {
        for (const line of wrapText(`  ${item.note}`, width)) push(line);
      }
    }

    push(("-").repeat(width));
    push(padLine("Subtotal", money(slip.subtotal), width));
    if (slip.tax != null && slip.tax > 0) {
      push(padLine("Tax", money(slip.tax), width));
    }
    push(("=").repeat(width));
    encoder.bold(true);
    const totalLine = padLine("TOTAL", money(slip.total), width);
    textLines.push(totalLine);
    encoder.line(totalLine);
    encoder.bold(false);
    push(("=").repeat(width));

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
    const encoder = new EscPosEncoder().initialize();

    const push = (line = "") => {
      textLines.push(line);
      encoder.line(line);
    };
    const pushCenter = (line: string, bold = false) => {
      textLines.push(line);
      encoder.align("center");
      if (bold) encoder.bold(true);
      encoder.line(line);
      if (bold) encoder.bold(false);
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
    encoder.bold(false);
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
    const encoder = new EscPosEncoder().initialize();

    const push = (line = "") => {
      textLines.push(line);
      encoder.line(line);
    };
    const pushCenter = (line: string, bold = false) => {
      textLines.push(line);
      encoder.align("center");
      if (bold) encoder.bold(true);
      encoder.line(line);
      if (bold) encoder.bold(false);
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
    encoder.bold(false);
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
