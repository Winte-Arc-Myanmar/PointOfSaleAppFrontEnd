import type { DataTableAction } from "@/presentation/components/data-table";
import type { VoidReason } from "@/core/domain/entities/VoidReason";

export interface VoidReasonRowActionsConfig {
  onView?: (row: VoidReason) => void;
  onEdit?: (row: VoidReason) => void;
  onDelete?: (row: VoidReason) => void;
}

export function getVoidReasonRowActions(
  config: VoidReasonRowActionsConfig,
): DataTableAction<VoidReason>[] {
  const actions: DataTableAction<VoidReason>[] = [];
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
