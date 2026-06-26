import type { DataTableAction } from "@/presentation/components/data-table";
import type { TaxRate } from "@/core/domain/entities/TaxRate";

export interface TaxRateRowActionsConfig {
  onView?: (row: TaxRate) => void;
  onEdit?: (row: TaxRate) => void;
  onDelete?: (row: TaxRate) => void;
}

export function getTaxRateRowActions(
  config: TaxRateRowActionsConfig
): DataTableAction<TaxRate>[] {
  const actions: DataTableAction<TaxRate>[] = [];
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
