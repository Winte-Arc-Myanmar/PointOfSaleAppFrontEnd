import type { DataTableAction } from "@/presentation/components/data-table";
import type { KdsTicket } from "@/core/domain/entities/KdsTicket";

export interface KdsTicketRowActionsConfig {
  onView?: (row: KdsTicket) => void;
  onStart?: (row: KdsTicket) => void;
  onReady?: (row: KdsTicket) => void;
  onRecall?: (row: KdsTicket) => void;
  onExpedite?: (row: KdsTicket) => void;
}

export function getKdsTicketRowActions(
  config: KdsTicketRowActionsConfig,
): DataTableAction<KdsTicket>[] {
  const actions: DataTableAction<KdsTicket>[] = [];
  if (config.onView) actions.push({ label: "View", onClick: config.onView });
  if (config.onStart) actions.push({ label: "Start", onClick: config.onStart });
  if (config.onReady) actions.push({ label: "Ready", onClick: config.onReady });
  if (config.onRecall) actions.push({ label: "Recall", onClick: config.onRecall });
  if (config.onExpedite) actions.push({ label: "Expedite", onClick: config.onExpedite });
  return actions;
}
