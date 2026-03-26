import type { DataTableAction } from "@/presentation/components/data-table";
import type { Tenant } from "@/core/domain/entities/Tenant";

export interface TenantRowActionsProps {
  onView?: (tenant: Tenant) => void;
  onEdit?: (tenant: Tenant) => void;
  onDelete?: (tenant: Tenant) => void;
}

export function getTenantRowActions({
  onView,
  onEdit,
  onDelete,
}: TenantRowActionsProps): DataTableAction<Tenant>[] {
  const actions: DataTableAction<Tenant>[] = [];
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
