import type { DataTableAction } from "@/presentation/components/data-table";
import type { ReconciliationMatch } from "@/core/domain/entities/ReconciliationMatch";

export interface ReconciliationMatchRowActionsConfig {
  onView?: (row: ReconciliationMatch) => void;
  onEdit?: (row: ReconciliationMatch) => void;
  onDelete?: (row: ReconciliationMatch) => void;
}

export function getReconciliationMatchRowActions(
  config: ReconciliationMatchRowActionsConfig
): DataTableAction<ReconciliationMatch>[] {
  const actions: DataTableAction<ReconciliationMatch>[] = [];
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
