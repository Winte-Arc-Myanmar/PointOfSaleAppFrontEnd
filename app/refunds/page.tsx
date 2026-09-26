import { Suspense } from "react";
import { Shell } from "@/presentation/components/layout/Shell";
import { RefundSection } from "@/features/refunds/presentation/RefundSection";
import { AppLoader } from "@/presentation/components/loader";

export default function RefundsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage refunds.</p>
        <Suspense fallback={<AppLoader message="Loading refund form..." />}>
          <RefundSection />
        </Suspense>
      </div>
    </Shell>
  );
}

