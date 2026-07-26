import { Shell } from "@/presentation/components/layout/Shell";
import { PurchaseRequisitionList } from "@/features/purchase-requisitions/presentation/PurchaseRequisitionList";

export default function PurchaseRequisitionsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage purchase requisitions.</p>
        <section>
          <h2 className="section-label mb-4">Purchase requisitions</h2>
          <PurchaseRequisitionList />
        </section>
      </div>
    </Shell>
  );
}
