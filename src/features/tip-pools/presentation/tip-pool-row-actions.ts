import type { TipPool } from "@/core/domain/entities/TipPool";
import type { DataTableAction } from "@/presentation/components/data-table";

export interface TipPoolRowActionsConfig {
  onView?: (row: TipPool) => void;
  onEdit?: (row: TipPool) => void;
  onDistribute?: (row: TipPool) => void;
  onSettle?: (row: TipPool) => void;
  onDelete?: (row: TipPool) => void;
}

export function getTipPoolRowActions(
  config: TipPoolRowActionsConfig,
): DataTableAction<TipPool>[] {
  const actions: DataTableAction<TipPool>[] = [];
  if (config.onView) actions.push({ label: "View", onClick: config.onView });
  if (config.onEdit) actions.push({ label: "Edit", onClick: config.onEdit });
  if (config.onDistribute) actions.push({ label: "Distribute", onClick: config.onDistribute });
  if (config.onSettle) actions.push({ label: "Settle", onClick: config.onSettle });
  if (config.onDelete) {
    actions.push({
      label: "Delete",
      onClick: config.onDelete,
      variant: "destructive",
    });
  }
  return actions;
}
