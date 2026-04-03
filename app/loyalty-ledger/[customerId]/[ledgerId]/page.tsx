import { LoyaltyLedgerDetailShell } from "@/features/loyalty-ledger/presentation/LoyaltyLedgerDetailShell";

interface PageProps {
  params: Promise<{ customerId: string; ledgerId: string }>;
}

export default async function LoyaltyLedgerEntryDetailSectionPage({
  params,
}: PageProps) {
  const { customerId, ledgerId } = await params;
  return (
    <LoyaltyLedgerDetailShell
      customerId={customerId}
      entryId={ledgerId}
      placement="loyalty-menu"
    />
  );
}
