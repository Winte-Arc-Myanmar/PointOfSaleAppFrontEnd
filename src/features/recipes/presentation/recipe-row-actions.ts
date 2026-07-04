import type { DataTableAction } from "@/presentation/components/data-table";
import type { Recipe } from "@/core/domain/entities/Recipe";

export interface RecipeRowActionsConfig {
  onView?: (row: Recipe) => void;
  onEdit?: (row: Recipe) => void;
  onDelete?: (row: Recipe) => void;
}

export function getRecipeRowActions(
  config: RecipeRowActionsConfig,
): DataTableAction<Recipe>[] {
  const actions: DataTableAction<Recipe>[] = [];
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
