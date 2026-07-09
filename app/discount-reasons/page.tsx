import { DiscountReasonList } from "@/features/discount-reasons/presentation/DiscountReasonList";
import { Shell } from "@/presentation/components/layout/Shell";

export default function DiscountReasonsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage discount reasons.</p>
        <section>
          <h2 className="section-label mb-4">Discount reasons</h2>
          <DiscountReasonList />
        </section>
      </div>
    </Shell>
  );
}
