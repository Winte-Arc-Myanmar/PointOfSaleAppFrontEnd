import { Shell } from "@/presentation/components/layout/Shell";
import { CustomerInteractionDetail } from "./CustomerInteractionDetail";
import {
  getCustomerInteractionsListPath,
  type CustomerInteractionsPlacement,
} from "./customer-interactions-routing";

export interface CustomerInteractionDetailShellProps {
  customerId: string;
  interactionId: string;
  placement: CustomerInteractionsPlacement;
}

export function CustomerInteractionDetailShell({
  customerId,
  interactionId,
  placement,
}: CustomerInteractionDetailShellProps) {
  const listHref = getCustomerInteractionsListPath(customerId, placement);

  return (
    <Shell>
      <CustomerInteractionDetail
        customerId={customerId}
        interactionId={interactionId}
        listHref={listHref}
      />
    </Shell>
  );
}
