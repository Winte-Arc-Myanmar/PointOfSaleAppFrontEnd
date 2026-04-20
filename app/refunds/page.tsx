import { Shell } from "@/presentation/components/layout/Shell";
import { RefundSection } from "@/features/refunds/presentation/RefundSection";

export default function RefundsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Process a return/refund for a completed sale, then view its details.
        </p>
        <RefundSection />
      </div>
    </Shell>
  );
}

