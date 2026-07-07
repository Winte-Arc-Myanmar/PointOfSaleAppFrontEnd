import type { DataTableAction } from "@/presentation/components/data-table";
import type { PricingSchedule } from "@/core/domain/entities/PricingSchedule";

export interface PricingScheduleRowActionsConfig {
  onView?: (row: PricingSchedule) => void;
  onEdit?: (row: PricingSchedule) => void;
  onDelete?: (row: PricingSchedule) => void;
}

export function getPricingScheduleRowActions(
  config: PricingScheduleRowActionsConfig,
): DataTableAction<PricingSchedule>[] {
  const actions: DataTableAction<PricingSchedule>[] = [];
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
