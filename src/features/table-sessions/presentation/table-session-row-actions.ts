import type { DataTableAction } from "@/presentation/components/data-table";
import type { TableSession } from "@/core/domain/entities/TableSession";

export interface TableSessionRowActionsConfig {
  onView?: (row: TableSession) => void;
  onEdit?: (row: TableSession) => void;
}

export function getTableSessionRowActions(
  config: TableSessionRowActionsConfig,
): DataTableAction<TableSession>[] {
  const actions: DataTableAction<TableSession>[] = [];
  if (config.onView) actions.push({ label: "View", onClick: config.onView });
  if (config.onEdit) actions.push({ label: "Edit", onClick: config.onEdit });
  return actions;
}
