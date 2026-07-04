import type { DataTableAction } from "@/presentation/components/data-table";
import type { ModifierGroup } from "@/core/domain/entities/ModifierGroup";

type ModifierGroupRowActionOptions = {
  onView?: (group: ModifierGroup) => void;
  onEdit?: (group: ModifierGroup) => void;
  onDelete?: (group: ModifierGroup) => void;
};

export function getModifierGroupRowActions(
  options: ModifierGroupRowActionOptions = {},
): DataTableAction<ModifierGroup>[] {
  const actions: DataTableAction<ModifierGroup>[] = [];
  if (options.onView) actions.push({ label: "View", onClick: options.onView });
  if (options.onEdit) actions.push({ label: "Edit", onClick: options.onEdit });
  if (options.onDelete) {
    actions.push({
      label: "Delete",
      variant: "destructive",
      onClick: options.onDelete,
    });
  }
  return actions;
}
