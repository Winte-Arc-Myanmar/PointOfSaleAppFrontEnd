import type { DataTableAction } from "@/presentation/components/data-table";
import type { AccountingPeriod } from "@/core/domain/entities/AccountingPeriod";

export interface AccountingPeriodRowActionsConfig {
  onView?: (row: AccountingPeriod) => void;
  onEdit?: (row: AccountingPeriod) => void;
  onDelete?: (row: AccountingPeriod) => void;
}

export function getAccountingPeriodRowActions(
  config: AccountingPeriodRowActionsConfig
): DataTableAction<AccountingPeriod>[] {
  const actions: DataTableAction<AccountingPeriod>[] = [];
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
