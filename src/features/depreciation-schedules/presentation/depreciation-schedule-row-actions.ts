import type { DataTableAction } from "@/presentation/components/data-table";
import type { DepreciationSchedule } from "@/core/domain/entities/DepreciationSchedule";

export interface DepreciationScheduleRowActionsConfig {
  onView?: (row: DepreciationSchedule) => void;
  onEdit?: (row: DepreciationSchedule) => void;
  onDelete?: (row: DepreciationSchedule) => void;
}

export function getDepreciationScheduleRowActions(
  config: DepreciationScheduleRowActionsConfig
): DataTableAction<DepreciationSchedule>[] {
  const actions: DataTableAction<DepreciationSchedule>[] = [];
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
