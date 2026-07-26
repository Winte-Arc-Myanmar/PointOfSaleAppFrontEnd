import { Shell } from "@/presentation/components/layout/Shell";
import { TransferOrderLinesPageWithOrderSelect } from "@/features/transfer-order-lines/presentation/TransferOrderLinesPageWithOrderSelect";

export default function TransferOrderLinesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage transfer order lines.</p>
        <section>
          <h2 className="section-label mb-4">Transfer order lines</h2>
          <TransferOrderLinesPageWithOrderSelect />
        </section>
      </div>
    </Shell>
  );
}
