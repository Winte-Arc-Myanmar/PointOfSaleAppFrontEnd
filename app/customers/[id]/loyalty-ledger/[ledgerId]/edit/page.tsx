import { Shell } from "@/presentation/components/layout/Shell";
import { EditLoyaltyLedgerForm } from "@/features/loyalty-ledger/presentation/EditLoyaltyLedgerForm";

interface PageProps {
  params: Promise<{ id: string; ledgerId: string }>;
}

export default async function LoyaltyLedgerEntryEditPage({ params }: PageProps) {
  const { id: customerId, ledgerId } = await params;
  return (
    <Shell>
      <EditLoyaltyLedgerForm customerId={customerId} entryId={ledgerId} />
    </Shell>
  );
}
