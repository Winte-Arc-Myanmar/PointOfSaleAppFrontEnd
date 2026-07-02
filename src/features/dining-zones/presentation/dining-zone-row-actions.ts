import type { DataTableAction } from "@/presentation/components/data-table";
import type { DiningZone } from "@/core/domain/entities/DiningZone";

export interface DiningZoneRowActionsConfig {
  onView?: (row: DiningZone) => void;
  onEdit?: (row: DiningZone) => void;
  onDelete?: (row: DiningZone) => void;
}

export function getDiningZoneRowActions(
  config: DiningZoneRowActionsConfig
): DataTableAction<DiningZone>[] {
  const actions: DataTableAction<DiningZone>[] = [];
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
