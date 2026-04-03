import type { DataTableAction } from "@/presentation/components/data-table";
import type { CustomerInteraction } from "@/core/domain/entities/CustomerInteraction";

export interface CustomerInteractionRowActionsProps {
  onView?: (row: CustomerInteraction) => void;
  onEdit?: (row: CustomerInteraction) => void;
  onDelete?: (row: CustomerInteraction) => void;
}

export function getCustomerInteractionRowActions({
  onView,
  onEdit,
  onDelete,
}: CustomerInteractionRowActionsProps): DataTableAction<CustomerInteraction>[] {
  const actions: DataTableAction<CustomerInteraction>[] = [];
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
