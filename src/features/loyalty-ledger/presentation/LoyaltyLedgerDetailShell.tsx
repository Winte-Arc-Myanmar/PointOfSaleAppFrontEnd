import { Shell } from "@/presentation/components/layout/Shell";
import { LoyaltyLedgerDetail } from "./LoyaltyLedgerDetail";
import {
  getLoyaltyLedgerListPath,
  type LoyaltyLedgerPlacement,
} from "./loyalty-ledger-routing";

export interface LoyaltyLedgerDetailShellProps {
  customerId: string;
  entryId: string;
  placement: LoyaltyLedgerPlacement;
}

export function LoyaltyLedgerDetailShell({
  customerId,
  entryId,
  placement,
}: LoyaltyLedgerDetailShellProps) {
  const listHref = getLoyaltyLedgerListPath(customerId, placement);

  return (
    <Shell>
      <LoyaltyLedgerDetail
        customerId={customerId}
        entryId={entryId}
        listHref={listHref}
      />
    </Shell>
  );
}
