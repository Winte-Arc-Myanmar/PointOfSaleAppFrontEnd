import { Shell } from "@/presentation/components/layout/Shell";
import { TransferOrderList } from "@/features/transfer-orders/presentation/TransferOrderList";

export default function TransferOrdersPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage transfer orders.</p>
        <section>
          <h2 className="section-label mb-4">Transfer orders</h2>
          <TransferOrderList />
        </section>
      </div>
    </Shell>
  );
}
