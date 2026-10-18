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
  /** Rows the signed-in person may only view, such as an Owner when they are not one. */
  isLocked?: (user: AppUser) => boolean;
}

export function getUserRowActions({
  onView,
  onEdit,
  onResetPassword,
  onSuspend,
  onReactivate,
  onDelete,
  isLocked = () => false,
}: UserRowActionsProps): DataTableAction<AppUser>[] {
  const actions: DataTableAction<AppUser>[] = [];
  if (onView) actions.push({ label: "View", onClick: onView });
  if (onEdit) actions.push({ label: "Edit", onClick: onEdit, disabled: isLocked });
  if (onResetPassword) {
    actions.push({ label: "Reset password", onClick: onResetPassword, disabled: isLocked });
  }
  if (onSuspend) {
    actions.push({
      label: "Suspend",
      onClick: onSuspend,
      disabled: (u) => isLocked(u) || isSuspended(u),
    });
  }
  if (onReactivate) {
    actions.push({
      label: "Reactivate",
      onClick: onReactivate,
      disabled: (u) => isLocked(u) || !isSuspended(u),
    });
  }
  if (onDelete) {
    actions.push({
      label: "Delete",
      onClick: onDelete,
      disabled: isLocked,
      variant: "destructive",
    });
  }
  return actions;
}
