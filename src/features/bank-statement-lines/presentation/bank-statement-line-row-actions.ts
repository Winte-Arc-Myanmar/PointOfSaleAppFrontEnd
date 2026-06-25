import type { DataTableAction } from "@/presentation/components/data-table";
import type { BankStatementLine } from "@/core/domain/entities/BankStatementLine";

export interface BankStatementLineRowActionsConfig {
  onView?: (row: BankStatementLine) => void;
  onEdit?: (row: BankStatementLine) => void;
  onDelete?: (row: BankStatementLine) => void;
}

export function getBankStatementLineRowActions(
  config: BankStatementLineRowActionsConfig
): DataTableAction<BankStatementLine>[] {
  const actions: DataTableAction<BankStatementLine>[] = [];
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
