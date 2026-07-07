import type { DataTableAction } from "@/presentation/components/data-table";
import type { Bundle } from "@/core/domain/entities/Bundle";

export interface BundleRowActionsConfig {
  onView?: (row: Bundle) => void;
  onEdit?: (row: Bundle) => void;
  onDelete?: (row: Bundle) => void;
}

export function getBundleRowActions(
  config: BundleRowActionsConfig,
): DataTableAction<Bundle>[] {
  const actions: DataTableAction<Bundle>[] = [];
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
