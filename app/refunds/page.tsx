import { Suspense } from "react";
import { Shell } from "@/presentation/components/layout/Shell";
import { RefundSection } from "@/features/refunds/presentation/RefundSection";
import { AppLoader } from "@/presentation/components/loader";

export default function RefundsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <Suspense fallback={<AppLoader fullScreen={false} size="sm" message="Loading refund form..." />}>
          <RefundSection />
        </Suspense>
      </div>
    </Shell>
  );
}

