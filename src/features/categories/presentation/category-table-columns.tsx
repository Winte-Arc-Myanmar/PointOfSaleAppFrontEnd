import { Eye, PencilLine, Trash2 } from "lucide-react";
import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Category } from "@/core/domain/entities/Category";
import type { CategoryRowActionsConfig } from "./category-row-actions";

type CategoryTableColumnOptions = {
  onView?: (category: Category) => void;
  productCountByCategoryId?: Map<string, number>;
  getDescription?: (category: Category) => string;
};

function defaultDescription(category: Category) {
  const description = category.description?.trim();
  return description && description.length > 0 ? description : "No description";
}

export function getCategoryTableColumns(
  options: CategoryTableColumnOptions = {},
): DataTableColumn<Category>[] {
  const { onView, productCountByCategoryId, getDescription = defaultDescription } =
    options;

  const columns: DataTableColumn<Category>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (category) =>
        onView ? (
          <button
            type="button"
            onClick={() => onView(category)}
            className="text-left text-sm font-semibold text-foreground transition hover:text-mint"
          >
            {category.name}
          </button>
        ) : (
          <span className="text-sm font-semibold text-foreground">{category.name}</span>
        ),
    },
    {
      key: "description",
      header: "Description",
      render: (category) => (
        <p className="max-w-[420px] text-sm leading-6 text-muted">
          {getDescription(category)}
        </p>
      ),
    },
  ];

  if (productCountByCategoryId) {
    columns.push({
      key: "products",
      header: "Products",
      render: (category) => (
        <span className="text-sm text-muted">
          {productCountByCategoryId.get(String(category.id)) ?? 0}
        </span>
      ),
    });
  }

  return columns;
}

export function getCategoryInlineActionsColumn(
  config: CategoryRowActionsConfig,
): DataTableColumn<Category> {
  return {
    key: "actions",
    header: "Actions",
    className: "text-right",
    render: (category) => (
      <div className="flex items-center justify-end gap-2">
        {config.onView ? (
          <button
            type="button"
            onClick={() => config.onView?.(category)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-mint/40 hover:bg-mint/10 hover:text-foreground"
            title={`View ${category.name}`}
            aria-label={`View ${category.name}`}
          >
            <Eye className="size-4" />
          </button>
        ) : null}
        {config.onEdit ? (
          <button
            type="button"
            onClick={() => config.onEdit?.(category)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-mint/40 hover:bg-mint/10 hover:text-foreground"
            title={`Edit ${category.name}`}
            aria-label={`Edit ${category.name}`}
          >
            <PencilLine className="size-4" />
          </button>
        ) : null}
        {config.onDelete ? (
          <button
            type="button"
            onClick={() => config.onDelete?.(category)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            title={`Delete ${category.name}`}
            aria-label={`Delete ${category.name}`}
          >
            <Trash2 className="size-4" />
          </button>
        ) : null}
      </div>
    ),
  };
}
