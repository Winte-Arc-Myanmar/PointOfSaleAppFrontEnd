import type { DataTableAction } from "@/presentation/components/data-table";
import type { PosRegister } from "@/core/domain/entities/PosRegister";

export interface PosRegisterRowActionsConfig {
  onView?: (row: PosRegister) => void;
  onEdit?: (row: PosRegister) => void;
  onDelete?: (row: PosRegister) => void;
}

export function getPosRegisterRowActions(
  config: PosRegisterRowActionsConfig
): DataTableAction<PosRegister>[] {
  const actions: DataTableAction<PosRegister>[] = [];
  if (config.onView) actions.push({ label: "View", onClick: config.onView });
  if (config.onEdit) actions.push({ label: "Edit", onClick: config.onEdit });
  if (config.onDelete) {
    actions.push({ label: "Delete", onClick: config.onDelete, variant: "destructive" });
  }
  return actions;
}

