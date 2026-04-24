import { Shell } from "@/presentation/components/layout/Shell";
import { ChartOfAccountList } from "@/features/chart-of-accounts/presentation/ChartOfAccountList";

export default function ChartOfAccountsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Manage your accounting chart structure with account hierarchy and account types.
        </p>
        <section>
          <h2 className="section-label mb-4">Chart of accounts</h2>
          <ChartOfAccountList />
        </section>
      </div>
    </Shell>
  );
}

