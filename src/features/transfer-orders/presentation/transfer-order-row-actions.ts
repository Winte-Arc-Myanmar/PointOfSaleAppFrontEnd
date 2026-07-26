import type { DataTableAction } from "@/presentation/components/data-table";
import type { TransferOrder } from "@/core/domain/entities/TransferOrder";

export interface TransferOrderRowActionsConfig {
  onView?: (row: TransferOrder) => void;
  onEdit?: (row: TransferOrder) => void;
  onDelete?: (row: TransferOrder) => void;
}

export function getTransferOrderRowActions(
  config: TransferOrderRowActionsConfig
): DataTableAction<TransferOrder>[] {
  const actions: DataTableAction<TransferOrder>[] = [];
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
