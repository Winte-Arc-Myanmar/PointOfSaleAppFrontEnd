import { Suspense } from "react";
import { Shell } from "@/presentation/components/layout/Shell";
import { PurchaseOrderList } from "@/features/purchase-orders/presentation/PurchaseOrderList";
import { AppLoader } from "@/presentation/components/loader";

export default function PurchaseOrdersPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage purchase orders.</p>
        <section>
          <h2 className="section-label mb-4">Purchase orders</h2>
          <Suspense fallback={<AppLoader fullScreen={false} size="sm" message="Loading..." />}>
            <PurchaseOrderList />
          </Suspense>
        </section>
      </div>
    </Shell>
  );
}
