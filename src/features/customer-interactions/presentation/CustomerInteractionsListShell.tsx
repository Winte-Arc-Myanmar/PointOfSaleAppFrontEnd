import Link from "next/link";
import { Shell } from "@/presentation/components/layout/Shell";
import { Button } from "@/presentation/components/ui/button";
import { CustomerInteractionList } from "./CustomerInteractionList";
import {
  getCustomerInteractionsListPath,
  type CustomerInteractionsPlacement,
} from "./customer-interactions-routing";

export interface CustomerInteractionsListShellProps {
  customerId: string;
  placement: CustomerInteractionsPlacement;
}

export function CustomerInteractionsListShell({
  customerId,
  placement,
}: CustomerInteractionsListShellProps) {
  const routeBasePath = getCustomerInteractionsListPath(customerId, placement);

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          {placement === "customer-profile" ? (
            <>
              <Link href={`/customers/${customerId}`}>
                <Button variant="outline" size="sm">
                  Back to customer
                </Button>
              </Link>
              <p className="page-description mb-0">
                Interactions for this customer.
              </p>
            </>
          ) : (
            <>
              <Link href="/customer-interactions">
                <Button variant="outline" size="sm">
                  All customers
                </Button>
              </Link>
              <Link href={`/customers/${customerId}`}>
                <Button variant="outline" size="sm">
                  Customer profile
                </Button>
              </Link>
            </>
          )}
        </div>
        <section>
          <h2 className="section-label mb-4">Interactions</h2>
          <CustomerInteractionList
            customerId={customerId}
            routeBasePath={routeBasePath}
          />
        </section>
      </div>
    </Shell>
  );
}
