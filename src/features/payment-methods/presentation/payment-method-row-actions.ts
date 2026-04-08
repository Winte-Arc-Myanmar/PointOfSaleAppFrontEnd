import type { DataTableAction } from "@/presentation/components/data-table";
import type { PaymentMethod } from "@/core/domain/entities/PaymentMethod";

export interface PaymentMethodRowActionsConfig {
  onView?: (row: PaymentMethod) => void;
  onEdit?: (row: PaymentMethod) => void;
  onDelete?: (row: PaymentMethod) => void;
}

export function getPaymentMethodRowActions(
  config: PaymentMethodRowActionsConfig
): DataTableAction<PaymentMethod>[] {
  const actions: DataTableAction<PaymentMethod>[] = [];
  if (config.onView) actions.push({ label: "View", onClick: config.onView });
  if (config.onEdit) actions.push({ label: "Edit", onClick: config.onEdit });
  if (config.onDelete) {
    actions.push({ label: "Delete", onClick: config.onDelete, variant: "destructive" });
  }
  return actions;
}

