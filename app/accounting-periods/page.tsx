import { Shell } from "@/presentation/components/layout/Shell";
import { AccountingPeriodList } from "@/features/accounting-periods/presentation/AccountingPeriodList";

export default function AccountingPeriodsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <section>
          <h2 className="section-label mb-4">Accounting periods</h2>
          <AccountingPeriodList />
        </section>
      </div>
    </Shell>
  );
}
