import type { DataTableAction } from "@/presentation/components/data-table";
import type { VendorInvoice } from "@/core/domain/entities/VendorInvoice";

export interface VendorInvoiceRowActionsConfig {
  onView?: (row: VendorInvoice) => void;
  onEdit?: (row: VendorInvoice) => void;
  onDelete?: (row: VendorInvoice) => void;
}

export function getVendorInvoiceRowActions(
  config: VendorInvoiceRowActionsConfig
): DataTableAction<VendorInvoice>[] {
  const actions: DataTableAction<VendorInvoice>[] = [];
  if (config.onView) actions.push({ label: "View", onClick: config.onView });
  if (config.onEdit) actions.push({ label: "Edit", onClick: config.onEdit });
  if (config.onDelete) {
    actions.push({
      label: "Delete",
      onClick: config.onDelete,
      variant: "destructive",
    });
  }
  return actions;
}
