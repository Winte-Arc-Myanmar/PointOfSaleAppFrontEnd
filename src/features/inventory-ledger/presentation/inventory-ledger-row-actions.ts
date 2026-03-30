import type { DataTableAction } from "@/presentation/components/data-table";
import type { InventoryLedgerEntry } from "@/core/domain/entities/InventoryLedgerEntry";

export interface InventoryLedgerRowActionsConfig {
  onView?: (row: InventoryLedgerEntry) => void;
  onDelete?: (row: InventoryLedgerEntry) => void;
}

export function getInventoryLedgerRowActions(
  config: InventoryLedgerRowActionsConfig
): DataTableAction<InventoryLedgerEntry>[] {
  const actions: DataTableAction<InventoryLedgerEntry>[] = [];
  if (config.onView) actions.push({ label: "View", onClick: config.onView });
  if (config.onDelete) {
    actions.push({
      label: "Delete",
      onClick: config.onDelete,
      variant: "destructive",
    });
  }
  return actions;
}
