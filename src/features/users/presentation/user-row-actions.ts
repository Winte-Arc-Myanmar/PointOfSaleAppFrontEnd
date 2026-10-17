import type { DataTableAction } from "@/presentation/components/data-table";
import type { AppUser } from "@/core/domain/entities/AppUser";
import { isSuspended } from "./user-status";

export interface UserRowActionsProps {
  onView?: (user: AppUser) => void;
  onEdit?: (user: AppUser) => void;
  onResetPassword?: (user: AppUser) => void;
  onSuspend?: (user: AppUser) => void;
  onReactivate?: (user: AppUser) => void;
  onDelete?: (user: AppUser) => void;
}

export function getUserRowActions({
  onView,
  onEdit,
  onResetPassword,
  onSuspend,
  onReactivate,
  onDelete,
}: UserRowActionsProps): DataTableAction<AppUser>[] {
  const actions: DataTableAction<AppUser>[] = [];
  if (onView) actions.push({ label: "View", onClick: onView });
  if (onEdit) actions.push({ label: "Edit", onClick: onEdit });
  if (onResetPassword) actions.push({ label: "Reset password", onClick: onResetPassword });
  if (onSuspend) {
    actions.push({ label: "Suspend", onClick: onSuspend, disabled: isSuspended });
  }
  if (onReactivate) {
    actions.push({ label: "Reactivate", onClick: onReactivate, disabled: (u) => !isSuspended(u) });
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
