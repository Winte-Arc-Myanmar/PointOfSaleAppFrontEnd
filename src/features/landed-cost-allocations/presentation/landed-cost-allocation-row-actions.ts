import type { DataTableAction } from "@/presentation/components/data-table";
import type { LandedCostAllocation } from "@/core/domain/entities/LandedCostAllocation";

export interface LandedCostAllocationRowActionsConfig {
  onView?: (row: LandedCostAllocation) => void;
  onEdit?: (row: LandedCostAllocation) => void;
  onDelete?: (row: LandedCostAllocation) => void;
}

export function getLandedCostAllocationRowActions(
  config: LandedCostAllocationRowActionsConfig
): DataTableAction<LandedCostAllocation>[] {
  const actions: DataTableAction<LandedCostAllocation>[] = [];
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
