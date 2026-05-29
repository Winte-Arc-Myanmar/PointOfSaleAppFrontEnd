"use client";

import Link from "next/link";
import { Shell } from "@/presentation/components/layout/Shell";
import { Button } from "@/presentation/components/ui/button";
import { useCustomer } from "@/presentation/hooks/useCustomers";
import { LoyaltyLedgerList } from "./LoyaltyLedgerList";
import {
  getLoyaltyLedgerListPath,
  type LoyaltyLedgerPlacement,
} from "./loyalty-ledger-routing";

export interface LoyaltyLedgerListShellProps {
  customerId: string;
  placement: LoyaltyLedgerPlacement;
}

export function LoyaltyLedgerListShell({
  customerId,
  placement,
}: LoyaltyLedgerListShellProps) {
  const routeBasePath = getLoyaltyLedgerListPath(customerId, placement);
  const { data: customer } = useCustomer(customerId);
  const customerName = customer?.name?.trim() || customerId;

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
                Loyalty ledger for: <span className="font-semibold text-foreground">{customerName}</span>
              </p>
            </>
          ) : (
            <>
              <Link href="/loyalty-ledger">
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
          <h2 className="section-label mb-4">Entries</h2>
          <LoyaltyLedgerList
            customerId={customerId}
            routeBasePath={routeBasePath}
          />
        </section>
      </div>
    </Shell>
  );
}
