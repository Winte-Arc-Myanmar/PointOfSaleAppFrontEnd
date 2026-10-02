import type { KitchenPrinter, PrinterSector } from "@/core/domain/entities/KitchenPrinter";

export function printersFor(
  printers: KitchenPrinter[],
  sector: PrinterSector,
  locationId: string,
  selectedIds: string[]
): KitchenPrinter[] {
  return printers.filter(
    (printer) =>
      selectedIds.includes(String(printer.id)) ||
      (printer.sectors.includes(sector) && printer.locationId === locationId)
  );
}
