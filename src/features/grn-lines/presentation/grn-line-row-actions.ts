import type { DataTableAction } from "@/presentation/components/data-table";
import type { GrnLine } from "@/core/domain/entities/GrnLine";

export interface GrnLineRowActionsConfig {
  onView?: (row: GrnLine) => void;
  onEdit?: (row: GrnLine) => void;
  onDelete?: (row: GrnLine) => void;
}

export function getGrnLineRowActions(
  config: GrnLineRowActionsConfig
): DataTableAction<GrnLine>[] {
  const actions: DataTableAction<GrnLine>[] = [];
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
