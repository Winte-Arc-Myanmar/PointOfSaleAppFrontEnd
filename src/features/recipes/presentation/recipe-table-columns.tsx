import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Recipe } from "@/core/domain/entities/Recipe";

type RecipeTableColumnOptions = {
  onView?: (recipe: Recipe) => void;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export function getRecipeTableColumns(
  options: RecipeTableColumnOptions = {},
): DataTableColumn<Recipe>[] {
  const { onView } = options;

  return [
    {
      key: "variantId",
      header: "Variant",
      sortable: true,
      className: "min-w-[220px] max-w-[300px]",
      render: (recipe) =>
        onView ? (
          <button
            type="button"
            className="truncate font-mono text-sm text-left text-foreground hover:text-mint transition-colors"
            onClick={() => onView(recipe)}
            title={recipe.variantId}
          >
            {recipe.variantId}
          </button>
        ) : (
          <span className="truncate font-mono text-sm text-foreground" title={recipe.variantId}>
            {recipe.variantId}
          </span>
        ),
    },
    {
      key: "yield",
      header: "Yield",
      sortable: true,
      className: "min-w-[120px]",
      render: (recipe) => <span className="font-medium">{recipe.yield}</span>,
    },
    {
      key: "ingredients",
      header: "Ingredients",
      className: "min-w-[120px]",
      render: (recipe) => <span>{recipe.ingredients?.length ?? 0}</span>,
    },
    {
      key: "isActive",
      header: "Status",
      className: "min-w-[100px]",
      render: (recipe) => (
        <span className={recipe.isActive ? "text-green-600 font-medium" : "text-muted"}>
          {recipe.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated at",
      sortable: true,
      className: "min-w-[180px]",
      render: (recipe) => <span className="text-muted">{formatDate(recipe.updatedAt)}</span>,
    },
  ];
}
