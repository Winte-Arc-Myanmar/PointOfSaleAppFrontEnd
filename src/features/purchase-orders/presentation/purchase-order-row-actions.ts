import type { DataTableAction } from "@/presentation/components/data-table";
import type { PurchaseOrder } from "@/core/domain/entities/PurchaseOrder";

export interface PurchaseOrderRowActionsConfig {
  onView?: (row: PurchaseOrder) => void;
  onEdit?: (row: PurchaseOrder) => void;
  onDelete?: (row: PurchaseOrder) => void;
}

export function getPurchaseOrderRowActions(
  config: PurchaseOrderRowActionsConfig
): DataTableAction<PurchaseOrder>[] {
  const actions: DataTableAction<PurchaseOrder>[] = [];
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
