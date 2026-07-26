import type { DataTableAction } from "@/presentation/components/data-table";
import type { TransferOrderLine } from "@/core/domain/entities/TransferOrderLine";

export interface TransferOrderLineRowActionsConfig {
  onView?: (row: TransferOrderLine) => void;
  onEdit?: (row: TransferOrderLine) => void;
  onDelete?: (row: TransferOrderLine) => void;
}

export function getTransferOrderLineRowActions(
  config: TransferOrderLineRowActionsConfig
): DataTableAction<TransferOrderLine>[] {
  const actions: DataTableAction<TransferOrderLine>[] = [];
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
