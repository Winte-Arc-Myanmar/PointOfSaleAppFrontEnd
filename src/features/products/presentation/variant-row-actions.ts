import type { DataTableAction } from "@/presentation/components/data-table";
import type { ProductVariant } from "@/core/domain/entities/ProductVariant";

export interface VariantRowActionsProps {
  onEdit?: (variant: ProductVariant) => void;
  onDelete?: (variant: ProductVariant) => void;
}

export function getVariantRowActions({
  onEdit,
  onDelete,
}: VariantRowActionsProps): DataTableAction<ProductVariant>[] {
  const actions: DataTableAction<ProductVariant>[] = [];
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
