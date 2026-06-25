import type { DataTableAction } from "@/presentation/components/data-table";
import type { ExchangeRate } from "@/core/domain/entities/ExchangeRate";

export interface ExchangeRateRowActionsConfig {
  onView?: (row: ExchangeRate) => void;
  onEdit?: (row: ExchangeRate) => void;
  onDelete?: (row: ExchangeRate) => void;
}

export function getExchangeRateRowActions(
  config: ExchangeRateRowActionsConfig
): DataTableAction<ExchangeRate>[] {
  const actions: DataTableAction<ExchangeRate>[] = [];
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
