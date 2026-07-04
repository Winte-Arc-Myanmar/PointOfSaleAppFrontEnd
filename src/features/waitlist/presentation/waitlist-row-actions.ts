import type { WaitlistEntry } from "@/core/domain/entities/Waitlist";
import type { DataTableAction } from "@/presentation/components/data-table";

export interface WaitlistRowActionsConfig {
  onView?: (row: WaitlistEntry) => void;
  onEdit?: (row: WaitlistEntry) => void;
  onNotify?: (row: WaitlistEntry) => void;
  onSeat?: (row: WaitlistEntry) => void;
  onCancel?: (row: WaitlistEntry) => void;
  onNoShow?: (row: WaitlistEntry) => void;
}

export function getWaitlistRowActions(
  config: WaitlistRowActionsConfig,
): DataTableAction<WaitlistEntry>[] {
  const actions: DataTableAction<WaitlistEntry>[] = [];
  if (config.onView) actions.push({ label: "View", onClick: config.onView });
  if (config.onEdit) actions.push({ label: "Edit", onClick: config.onEdit });
  if (config.onNotify) actions.push({ label: "Notify", onClick: config.onNotify });
  if (config.onSeat) actions.push({ label: "Seat", onClick: config.onSeat });
  if (config.onCancel) actions.push({ label: "Cancel", onClick: config.onCancel });
  if (config.onNoShow) actions.push({ label: "No-show", onClick: config.onNoShow });
  return actions;
}
