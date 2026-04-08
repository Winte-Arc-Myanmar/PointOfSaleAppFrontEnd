import type { DataTableAction } from "@/presentation/components/data-table";
import type { PosSession } from "@/core/domain/entities/PosSession";

export interface PosSessionRowActionsConfig {
  onView?: (row: PosSession) => void;
  onEdit?: (row: PosSession) => void;
  onDelete?: (row: PosSession) => void;
}

export function getPosSessionRowActions(
  config: PosSessionRowActionsConfig
): DataTableAction<PosSession>[] {
  const actions: DataTableAction<PosSession>[] = [];
  if (config.onView) actions.push({ label: "View", onClick: config.onView });
  if (config.onEdit) actions.push({ label: "Edit", onClick: config.onEdit });
  if (config.onDelete) {
    actions.push({ label: "Delete", onClick: config.onDelete, variant: "destructive" });
  }
  return actions;
}

