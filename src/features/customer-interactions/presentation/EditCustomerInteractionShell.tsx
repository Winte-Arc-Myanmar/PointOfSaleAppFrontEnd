import { Shell } from "@/presentation/components/layout/Shell";
import { EditCustomerInteractionForm } from "./EditCustomerInteractionForm";
import {
  getCustomerInteractionsListPath,
  type CustomerInteractionsPlacement,
} from "./customer-interactions-routing";

export interface EditCustomerInteractionShellProps {
  customerId: string;
  interactionId: string;
  placement: CustomerInteractionsPlacement;
}

export function EditCustomerInteractionShell({
  customerId,
  interactionId,
  placement,
}: EditCustomerInteractionShellProps) {
  const listHref = getCustomerInteractionsListPath(customerId, placement);

  return (
    <Shell>
      <EditCustomerInteractionForm
        customerId={customerId}
        interactionId={interactionId}
        listHref={listHref}
      />
    </Shell>
  );
}
