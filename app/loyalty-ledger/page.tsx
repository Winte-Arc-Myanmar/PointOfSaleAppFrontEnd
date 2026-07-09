import { Shell } from "@/presentation/components/layout/Shell";
import { LoyaltyLedgerPageWithCustomerSelect } from "@/features/loyalty-ledger/presentation/LoyaltyLedgerPageWithCustomerSelect";

export default function LoyaltyLedgerPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage loyalty ledger.</p>
        <section>
          <h2 className="section-label mb-4">Loyalty ledger</h2>
          <LoyaltyLedgerPageWithCustomerSelect />
        </section>
      </div>
    </Shell>
  );
}
