import { Suspense } from "react";
import { Shell } from "@/presentation/components/layout/Shell";
import { LandedCostAllocationList } from "@/features/landed-cost-allocations/presentation/LandedCostAllocationList";
import { AppLoader } from "@/presentation/components/loader";

export default function LandedCostAllocationsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage landed cost allocations.</p>
        <section>
          <h2 className="section-label mb-4">Landed cost allocations</h2>
          <Suspense
            fallback={
              <AppLoader fullScreen={false} size="sm" message="Loading..." />
            }
          >
            <LandedCostAllocationList />
          </Suspense>
        </section>
      </div>
    </Shell>
  );
}
