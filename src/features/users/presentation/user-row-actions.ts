import type { DataTableAction } from "@/presentation/components/data-table";
import type { AppUser } from "@/core/domain/entities/AppUser";

export interface UserRowActionsProps {
  onView?: (user: AppUser) => void;
  onEdit?: (user: AppUser) => void;
  onResetPassword?: (user: AppUser) => void;
  onDelete?: (user: AppUser) => void;
}

export function getUserRowActions({
  onView,
  onEdit,
  onResetPassword,
  onDelete,
}: UserRowActionsProps): DataTableAction<AppUser>[] {
  const actions: DataTableAction<AppUser>[] = [];
  if (onView) actions.push({ label: "View", onClick: onView });
  if (onEdit) actions.push({ label: "Edit", onClick: onEdit });
  if (onResetPassword) actions.push({ label: "Reset password", onClick: onResetPassword });
  if (onDelete) {
    actions.push({
      label: "Delete",
      onClick: onDelete,
      variant: "destructive",
    });
  }
  return actions;
}
