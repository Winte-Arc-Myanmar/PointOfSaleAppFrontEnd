import type { DataTableAction } from "@/presentation/components/data-table";
import type { PurchaseRequisition } from "@/core/domain/entities/PurchaseRequisition";

export interface PurchaseRequisitionRowActionsConfig {
  onView?: (row: PurchaseRequisition) => void;
  onEdit?: (row: PurchaseRequisition) => void;
  onDelete?: (row: PurchaseRequisition) => void;
}

export function getPurchaseRequisitionRowActions(
  config: PurchaseRequisitionRowActionsConfig
): DataTableAction<PurchaseRequisition>[] {
  const actions: DataTableAction<PurchaseRequisition>[] = [];
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
