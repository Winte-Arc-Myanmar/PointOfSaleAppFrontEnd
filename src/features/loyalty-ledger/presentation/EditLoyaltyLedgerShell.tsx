import { Shell } from "@/presentation/components/layout/Shell";
import { EditLoyaltyLedgerForm } from "./EditLoyaltyLedgerForm";
import {
  getLoyaltyLedgerListPath,
  type LoyaltyLedgerPlacement,
} from "./loyalty-ledger-routing";

export interface EditLoyaltyLedgerShellProps {
  customerId: string;
  entryId: string;
  placement: LoyaltyLedgerPlacement;
}

export function EditLoyaltyLedgerShell({
  customerId,
  entryId,
  placement,
}: EditLoyaltyLedgerShellProps) {
  const listHref = getLoyaltyLedgerListPath(customerId, placement);

  return (
    <Shell>
      <EditLoyaltyLedgerForm
        customerId={customerId}
        entryId={entryId}
        listHref={listHref}
      />
    </Shell>
  );
}
