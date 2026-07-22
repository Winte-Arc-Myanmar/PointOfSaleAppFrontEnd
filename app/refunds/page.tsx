import { Shell } from "@/presentation/components/layout/Shell";
import { RefundSection } from "@/features/refunds/presentation/RefundSection";

export default function RefundsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage refunds.</p>
        <RefundSection />
      </div>
    </Shell>
  );
}

