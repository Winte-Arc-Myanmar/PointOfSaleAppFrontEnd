import { PricingScheduleList } from "@/features/pricing-schedules/presentation/PricingScheduleList";
import { Shell } from "@/presentation/components/layout/Shell";

export default function PricingSchedulesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Configure time-based pricing schedules with rules for variants and categories.
        </p>
        <section>
          <h2 className="section-label mb-4">Pricing schedules</h2>
          <PricingScheduleList />
        </section>
      </div>
    </Shell>
  );
}
