import { Shell } from "@/presentation/components/layout/Shell";
import { ReconciliationMatchList } from "@/features/reconciliation-matches/presentation/ReconciliationMatchList";

export default function ReconciliationMatchesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Match bank statement lines to journal lines for bank reconciliation.
        </p>
        <section>
          <h2 className="section-label mb-4">Reconciliation matches</h2>
          <ReconciliationMatchList />
        </section>
      </div>
    </Shell>
  );
}
