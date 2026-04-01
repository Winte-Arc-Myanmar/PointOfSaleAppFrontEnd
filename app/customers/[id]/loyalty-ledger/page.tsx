import Link from "next/link";
import { Shell } from "@/presentation/components/layout/Shell";
import { LoyaltyLedgerList } from "@/features/loyalty-ledger/presentation/LoyaltyLedgerList";
import { Button } from "@/presentation/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerLoyaltyLedgerPage({ params }: PageProps) {
  const { id: customerId } = await params;
  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/customers/${customerId}`}>
            <Button variant="outline" size="sm">
              Back to customer
            </Button>
          </Link>
          <p className="page-description mb-0">
            Loyalty ledger for this customer.
          </p>
        </div>
        <section>
          <h2 className="section-label mb-4">Entries</h2>
          <LoyaltyLedgerList customerId={customerId} />
        </section>
      </div>
    </Shell>
  );
}
