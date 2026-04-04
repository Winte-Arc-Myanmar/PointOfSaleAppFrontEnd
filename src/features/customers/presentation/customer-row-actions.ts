import type { DataTableAction } from "@/presentation/components/data-table";
import type { Customer } from "@/core/domain/entities/Customer";

export interface CustomerRowActionsProps {
  onView?: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
}

export function getCustomerRowActions({
  onView,
  onEdit,
  onDelete,
}: CustomerRowActionsProps): DataTableAction<Customer>[] {
  const actions: DataTableAction<Customer>[] = [];
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

