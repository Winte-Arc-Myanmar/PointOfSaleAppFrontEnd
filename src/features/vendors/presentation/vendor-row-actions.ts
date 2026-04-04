import type { DataTableAction } from "@/presentation/components/data-table";
import type { Vendor } from "@/core/domain/entities/Vendor";

export interface VendorRowActionsProps {
  onView?: (vendor: Vendor) => void;
  onEdit?: (vendor: Vendor) => void;
  onDelete?: (vendor: Vendor) => void;
}

export function getVendorRowActions({
  onView,
  onEdit,
  onDelete,
}: VendorRowActionsProps): DataTableAction<Vendor>[] {
  const actions: DataTableAction<Vendor>[] = [];
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

