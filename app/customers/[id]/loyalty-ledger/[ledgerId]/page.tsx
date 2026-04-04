import { LoyaltyLedgerDetailShell } from "@/features/loyalty-ledger/presentation/LoyaltyLedgerDetailShell";

interface PageProps {
  params: Promise<{ id: string; ledgerId: string }>;
}

export default async function LoyaltyLedgerEntryDetailPage({
  params,
}: PageProps) {
  const { id: customerId, ledgerId } = await params;
  return (
    <LoyaltyLedgerDetailShell
      customerId={customerId}
      entryId={ledgerId}
      placement="customer-profile"
    />
  );
}
