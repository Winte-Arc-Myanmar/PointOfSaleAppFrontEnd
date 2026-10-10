import { Shell } from "@/presentation/components/layout/Shell";
import { InventoryLedgerList } from "@/features/inventory-ledger/presentation/InventoryLedgerList";

export default function InventoryLedgerPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <section>
          <h2 className="section-label mb-4">Ledger entries</h2>
          <InventoryLedgerList />
        </section>
      </div>
    </Shell>
  );
}
