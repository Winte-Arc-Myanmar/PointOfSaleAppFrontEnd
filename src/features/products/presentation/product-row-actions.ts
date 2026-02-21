import type { DataTableAction } from "@/presentation/components/data-table";
import type { Product } from "@/core/domain/entities/Product";

export interface ProductRowActionsProps {
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

/**
 * Row actions for the products DataTable.
 * Each page can pass its own handlers (e.g. navigate to detail, open edit modal, delete).
 */
export function getProductRowActions({
  onView,
  onEdit,
  onDelete,
}: ProductRowActionsProps): DataTableAction<Product>[] {
  const actions: DataTableAction<Product>[] = [];

  if (onView) {
    actions.push({ label: "View", onClick: onView });
  }
  if (onEdit) {
    actions.push({ label: "Edit", onClick: onEdit });
  }
  if (onDelete) {
    actions.push({
      label: "Delete",
      onClick: onDelete,
      variant: "destructive",
    });
  }

  return actions;
}
