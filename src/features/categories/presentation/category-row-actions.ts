import type { DataTableAction } from "@/presentation/components/data-table";
import type { Category } from "@/core/domain/entities/Category";

export interface CategoryRowActionsConfig {
  onView?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export function getCategoryRowActions(
  config: CategoryRowActionsConfig
): DataTableAction<Category>[] {
  const actions: DataTableAction<Category>[] = [];
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
