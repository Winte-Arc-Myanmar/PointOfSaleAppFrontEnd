import type { DataTableAction } from "@/presentation/components/data-table";
import type { DiscountReason } from "@/core/domain/entities/DiscountReason";

export interface DiscountReasonRowActionsConfig {
  onView?: (row: DiscountReason) => void;
  onEdit?: (row: DiscountReason) => void;
  onDelete?: (row: DiscountReason) => void;
}

export function getDiscountReasonRowActions(
  config: DiscountReasonRowActionsConfig,
): DataTableAction<DiscountReason>[] {
  const actions: DataTableAction<DiscountReason>[] = [];
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
