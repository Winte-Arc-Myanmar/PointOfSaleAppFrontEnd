import { Shell } from "@/presentation/components/layout/Shell";
import { AccountingPeriodList } from "@/features/accounting-periods/presentation/AccountingPeriodList";

export default function AccountingPeriodsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Define fiscal periods for your organization to organize and close accounting activity.
        </p>
        <section>
          <h2 className="section-label mb-4">Accounting periods</h2>
          <AccountingPeriodList />
        </section>
      </div>
    </Shell>
  );
}
