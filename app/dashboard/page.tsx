import { DashboardView } from "@/features/dashboard/presentation/DashboardView";
import { Shell } from "@/presentation/components/layout/Shell";

export default function DashboardPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Charts for sales, items, till movements, guest cards, and loyalty.
        </p>
        <section>
          <h2 className="section-label mb-4">Dashboard</h2>
          <DashboardView />
        </section>
      </div>
    </Shell>
  );
}
