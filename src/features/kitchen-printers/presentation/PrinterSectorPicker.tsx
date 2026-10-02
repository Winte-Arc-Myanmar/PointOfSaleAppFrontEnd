"use client";

import { Label } from "@/presentation/components/ui/label";
import { PRINTER_SECTORS, type PrinterSector } from "@/core/domain/entities/KitchenPrinter";

export const PRINTER_SECTOR_LABELS: Record<PrinterSector, string> = {
  KDS: "KDS station",
  CHECKOUT: "Checkout",
  FINANCE: "Finance",
};

export interface PrinterSectorPickerProps {
  value: PrinterSector[];
  onChange: (sectors: PrinterSector[]) => void;
  error?: string;
}

export function PrinterSectorPicker({ value, onChange, error }: PrinterSectorPickerProps) {
  const toggle = (sector: PrinterSector) =>
    onChange(
      value.includes(sector)
        ? value.filter((s) => s !== sector)
        : PRINTER_SECTORS.filter((s) => s === sector || value.includes(s))
    );

  return (
    <div className="grid gap-2">
      <Label>Sectors</Label>
      <p className="text-xs text-muted">Where this printer serves. Pick one or more.</p>
      <div className="flex flex-wrap gap-4 rounded-md border border-border p-3">
        {PRINTER_SECTORS.map((sector) => (
          <label key={sector} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={value.includes(sector)}
              onChange={() => toggle(sector)}
            />
            <span>{PRINTER_SECTOR_LABELS[sector]}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
