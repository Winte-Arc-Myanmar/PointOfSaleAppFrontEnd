import { ReportsDashboard } from "@/features/reports/presentation/ReportsDashboard";
import { Shell } from "@/presentation/components/layout/Shell";

export default function ReportsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage reports.</p>
        <section>
          <h2 className="section-label mb-4">Reports</h2>
          <ReportsDashboard />
        </section>
      </div>
    </Shell>
  );
}
