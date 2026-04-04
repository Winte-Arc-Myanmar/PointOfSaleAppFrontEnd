import type { DataTableAction } from "@/presentation/components/data-table";
import type { LoyaltyLedgerEntry } from "@/core/domain/entities/LoyaltyLedgerEntry";

export interface LoyaltyLedgerRowActionsProps {
  onView?: (entry: LoyaltyLedgerEntry) => void;
  onEdit?: (entry: LoyaltyLedgerEntry) => void;
  onDelete?: (entry: LoyaltyLedgerEntry) => void;
}

export function getLoyaltyLedgerRowActions({
  onView,
  onEdit,
  onDelete,
}: LoyaltyLedgerRowActionsProps): DataTableAction<LoyaltyLedgerEntry>[] {
  const actions: DataTableAction<LoyaltyLedgerEntry>[] = [];
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
