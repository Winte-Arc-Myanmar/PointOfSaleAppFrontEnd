import type { DataTableAction } from "@/presentation/components/data-table";
import type { Uom } from "@/core/domain/entities/Uom";

export interface UomRowActionsConfig {
  onView?: (uom: Uom) => void;
  onEdit?: (uom: Uom) => void;
  onDelete?: (uom: Uom) => void;
}

export function getUomRowActions(config: UomRowActionsConfig): DataTableAction<Uom>[] {
  const actions: DataTableAction<Uom>[] = [];
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
