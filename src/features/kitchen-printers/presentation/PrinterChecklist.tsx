"use client";

import { Label } from "@/presentation/components/ui/label";
import type { KitchenPrinter } from "@/core/domain/entities/KitchenPrinter";

export interface PrinterChecklistProps {
  label: string;
  hint: string;
  emptyText: string;
  printers: KitchenPrinter[];
  value: string[];
  onChange: (printerIds: string[]) => void;
  locationSelected: boolean;
}

export function PrinterChecklist({
  label,
  hint,
  emptyText,
  printers,
  value,
  onChange,
  locationSelected,
}: PrinterChecklistProps) {
  const toggle = (printerId: string) =>
    onChange(
      value.includes(printerId) ? value.filter((id) => id !== printerId) : [...value, printerId]
    );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-xs text-muted">{hint}</p>
      {!locationSelected ? (
        <p className="text-sm text-muted">Select a location first.</p>
      ) : printers.length === 0 ? (
        <p className="text-sm text-muted">{emptyText}</p>
      ) : (
        <div className="max-h-48 overflow-y-auto rounded-md border border-border p-3 space-y-2">
          {printers.map((printer) => {
            const id = String(printer.id);
            return (
              <label key={id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border"
                  checked={value.includes(id)}
                  onChange={() => toggle(id)}
                />
                <span>{printer.name}</span>
                {printer.ipAddress && (
                  <span className="font-mono text-xs text-muted">
                    {printer.ipAddress}:{printer.port}
                  </span>
                )}
                {!printer.isActive && <span className="text-xs text-muted">(inactive)</span>}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
