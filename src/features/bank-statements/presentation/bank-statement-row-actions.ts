import type { DataTableAction } from "@/presentation/components/data-table";
import type { BankStatement } from "@/core/domain/entities/BankStatement";

export interface BankStatementRowActionsConfig {
  onView?: (row: BankStatement) => void;
  onEdit?: (row: BankStatement) => void;
  onDelete?: (row: BankStatement) => void;
}

export function getBankStatementRowActions(
  config: BankStatementRowActionsConfig
): DataTableAction<BankStatement>[] {
  const actions: DataTableAction<BankStatement>[] = [];
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
