import type { DataTableAction } from "@/presentation/components/data-table";
import type { Reservation } from "@/core/domain/entities/Reservation";

export interface ReservationRowActionsConfig {
  onView?: (row: Reservation) => void;
  onEdit?: (row: Reservation) => void;
  onConfirm?: (row: Reservation) => void;
  onSeat?: (row: Reservation) => void;
  onCancel?: (row: Reservation) => void;
  onNoShow?: (row: Reservation) => void;
  onDelete?: (row: Reservation) => void;
}

export function getReservationRowActions(
  config: ReservationRowActionsConfig,
): DataTableAction<Reservation>[] {
  const actions: DataTableAction<Reservation>[] = [];
  if (config.onView) actions.push({ label: "View", onClick: config.onView });
  if (config.onEdit) actions.push({ label: "Edit", onClick: config.onEdit });
  if (config.onConfirm) actions.push({ label: "Confirm", onClick: config.onConfirm });
  if (config.onSeat) actions.push({ label: "Seat", onClick: config.onSeat });
  if (config.onCancel) actions.push({ label: "Cancel", onClick: config.onCancel });
  if (config.onNoShow) actions.push({ label: "No-show", onClick: config.onNoShow });
  if (config.onDelete) {
    actions.push({
      label: "Delete",
      onClick: config.onDelete,
      variant: "destructive",
    });
  }
  return actions;
}
