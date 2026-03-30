import { Shell } from "@/presentation/components/layout/Shell";
import { InventoryLedgerDetail } from "@/features/inventory-ledger/presentation/InventoryLedgerDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InventoryLedgerDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <InventoryLedgerDetail entryId={id} />
    </Shell>
  );
}
