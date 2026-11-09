"use client";

import { useEffect, useMemo } from "react";
import { Label } from "@/presentation/components/ui/label";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import {
  PRINT_AREAS,
  type PrintArea,
  type PrinterSector,
} from "@/core/domain/entities/KitchenPrinter";

export const PRINT_AREA_LABELS: Record<PrintArea, string> = {
  BAR: "Restaurant",
  KTV: "KTV",
  SPA: "SPA",
};

const AREA_PERMISSIONS: Record<PrintArea, string[]> = {
  BAR: ["dining-tables:read", "dining-zones:read"],
  KTV: ["hospitality:ktv-room:read"],
  SPA: ["hospitality:spa-room:read"],
};

export function printsBills(sectors: PrinterSector[]) {
  return sectors.includes("CHECKOUT") || sectors.includes("FINANCE");
}

/** The areas this user works with; all of them when none match. */
export function useBillAreas(): PrintArea[] {
  const { canAny } = usePermissions();
  const allowed = PRINT_AREAS.filter((area) => canAny(...AREA_PERMISSIONS[area]));
  const key = allowed.join(",");
  return useMemo(
    () => (key ? (key.split(",") as PrintArea[]) : [...PRINT_AREAS]),
    [key]
  );
}

export interface PrinterAreaPickerProps {
  value: PrintArea[];
  onChange: (areas: PrintArea[]) => void;
  error?: string;
}

export function PrinterAreaPicker({ value, onChange, error }: PrinterAreaPickerProps) {
  const areas = useBillAreas();
  const only = areas.length === 1 ? areas[0] : null;

  useEffect(() => {
    if (only && (value.length !== 1 || value[0] !== only)) onChange([only]);
  }, [only, value, onChange]);

  const toggle = (area: PrintArea) =>
    onChange(
      value.includes(area)
        ? value.filter((a) => a !== area)
        : PRINT_AREAS.filter((a) => a === area || value.includes(a))
    );

  return (
    <div className="grid gap-2">
      <Label>Prints bills for</Label>
      <p className="text-xs text-muted">Which area&apos;s bills come out on this printer.</p>
      <div className="flex flex-wrap gap-4 rounded-md border border-border p-3">
        {areas.map((area) => (
          <label key={area} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={value.includes(area)}
              disabled={Boolean(only)}
              onChange={() => toggle(area)}
            />
            <span>{PRINT_AREA_LABELS[area]}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
