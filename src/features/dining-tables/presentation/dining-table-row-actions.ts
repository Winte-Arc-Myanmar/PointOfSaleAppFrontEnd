import type { DataTableAction } from "@/presentation/components/data-table";
import type { DiningTable } from "@/core/domain/entities/DiningTable";

export interface DiningTableRowActionsConfig {
  onView?: (row: DiningTable) => void;
  onEdit?: (row: DiningTable) => void;
  onDelete?: (row: DiningTable) => void;
}

export function getDiningTableRowActions(
  config: DiningTableRowActionsConfig
): DataTableAction<DiningTable>[] {
  const actions: DataTableAction<DiningTable>[] = [];
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
