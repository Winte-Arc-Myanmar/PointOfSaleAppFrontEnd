import type { DataTableAction } from "@/presentation/components/data-table";
import type { KitchenPrinter } from "@/core/domain/entities/KitchenPrinter";

export interface KitchenPrinterRowActionsConfig {
  onView?: (row: KitchenPrinter) => void;
  onEdit?: (row: KitchenPrinter) => void;
  onDelete?: (row: KitchenPrinter) => void;
}

export function getKitchenPrinterRowActions(
  config: KitchenPrinterRowActionsConfig
): DataTableAction<KitchenPrinter>[] {
  const actions: DataTableAction<KitchenPrinter>[] = [];
  if (config.onView) actions.push({ label: "View", onClick: config.onView });
  if (config.onEdit) actions.push({ label: "Edit", onClick: config.onEdit });
  if (config.onDelete) {
    actions.push({
      label: "Delete",
      onClick: config.onDelete,
      variant: "destructive",
    });
  }
  return actions;
}
