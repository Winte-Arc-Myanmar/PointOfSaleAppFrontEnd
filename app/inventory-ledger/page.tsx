import { Shell } from "@/presentation/components/layout/Shell";
import { InventoryLedgerList } from "@/features/inventory-ledger/presentation/InventoryLedgerList";

export default function InventoryLedgerPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Stock movements, expiring lines, balance lookup, and write-offs — tied to variants and
          locations.
        </p>
        <InventoryLedgerList />
      </div>
    </Shell>
  );
}
