import { Shell } from "@/presentation/components/layout/Shell";
import { LoyaltyLedgerDetail } from "@/features/loyalty-ledger/presentation/LoyaltyLedgerDetail";

interface PageProps {
  params: Promise<{ id: string; ledgerId: string }>;
}

export default async function LoyaltyLedgerEntryDetailPage({
  params,
}: PageProps) {
  const { id: customerId, ledgerId } = await params;
  return (
    <Shell>
      <LoyaltyLedgerDetail customerId={customerId} entryId={ledgerId} />
    </Shell>
  );
}
