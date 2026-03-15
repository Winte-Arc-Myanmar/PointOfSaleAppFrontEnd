import type { DataTableAction } from "@/presentation/components/data-table";
import type { Branch } from "@/core/domain/entities/Branch";

export interface BranchRowActionsConfig {
  onView?: (branch: Branch) => void;
  onEdit?: (branch: Branch) => void;
  onDelete?: (branch: Branch) => void;
}

export function getBranchRowActions(
  config: BranchRowActionsConfig
): DataTableAction<Branch>[] {
  const actions: DataTableAction<Branch>[] = [];
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
