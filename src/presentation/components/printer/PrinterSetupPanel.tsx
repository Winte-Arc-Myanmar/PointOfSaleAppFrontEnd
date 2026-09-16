"use client";

import { ReceiptPrinterConnection } from "./ReceiptPrinterConnection";
import { KitchenPrinterConnection } from "./KitchenPrinterConnection";

export function PrinterSetupPanel({
  kitchenPrinterId,
  compact = false,
}: {
  kitchenPrinterId?: string;
  compact?: boolean;
}) {
  return (
    <div className="space-y-6">
      <ReceiptPrinterConnection compact={compact} />
      <KitchenPrinterConnection
        defaultPrinterId={kitchenPrinterId}
        compact={compact}
      />
    </div>
  );
}
