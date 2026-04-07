import type { DataTableAction } from "@/presentation/components/data-table";
import type { SalesOrder } from "@/core/domain/entities/SalesOrder";

export interface SalesOrderRowActionsConfig {
  onView?: (row: SalesOrder) => void;
  onEdit?: (row: SalesOrder) => void;
  onDelete?: (row: SalesOrder) => void;
}

export function getSalesOrderRowActions(
  config: SalesOrderRowActionsConfig
): DataTableAction<SalesOrder>[] {
  const actions: DataTableAction<SalesOrder>[] = [];
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

