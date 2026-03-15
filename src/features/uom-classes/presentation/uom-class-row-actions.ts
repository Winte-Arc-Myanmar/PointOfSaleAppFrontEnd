import type { DataTableAction } from "@/presentation/components/data-table";
import type { UomClass } from "@/core/domain/entities/UomClass";

export interface UomClassRowActionsProps {
  onView?: (uomClass: UomClass) => void;
  onEdit?: (uomClass: UomClass) => void;
  onDelete?: (uomClass: UomClass) => void;
}

export function getUomClassRowActions({
  onView,
  onEdit,
  onDelete,
}: UomClassRowActionsProps): DataTableAction<UomClass>[] {
  const actions: DataTableAction<UomClass>[] = [];
  if (onView) actions.push({ label: "View", onClick: onView });
  if (onEdit) actions.push({ label: "Edit", onClick: onEdit });
  if (onDelete) {
    actions.push({
      label: "Delete",
      onClick: onDelete,
      variant: "destructive",
    });
  }
  return actions;
}
