import { ReportsDashboard } from "@/features/reports/presentation/ReportsDashboard";
import { Shell } from "@/presentation/components/layout/Shell";

export default function ReportsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Full figures for every sales, till, guest-card, and loyalty report.
        </p>
        <section>
          <h2 className="section-label mb-4">Reports</h2>
          <ReportsDashboard />
        </section>
      </div>
    </Shell>
  );
}
