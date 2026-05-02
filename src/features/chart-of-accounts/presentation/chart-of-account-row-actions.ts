import type { DataTableAction } from "@/presentation/components/data-table";
import type { ChartOfAccount } from "@/core/domain/entities/ChartOfAccount";

export interface ChartOfAccountRowActionsConfig {
  onView?: (row: ChartOfAccount) => void;
  onEdit?: (row: ChartOfAccount) => void;
  onDelete?: (row: ChartOfAccount) => void;
}

export function getChartOfAccountRowActions(
  config: ChartOfAccountRowActionsConfig
): DataTableAction<ChartOfAccount>[] {
  const actions: DataTableAction<ChartOfAccount>[] = [];
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

