import { EditLoyaltyLedgerShell } from "@/features/loyalty-ledger/presentation/EditLoyaltyLedgerShell";

interface PageProps {
  params: Promise<{ customerId: string; ledgerId: string }>;
}

export default async function LoyaltyLedgerEntryEditSectionPage({
  params,
}: PageProps) {
  const { customerId, ledgerId } = await params;
  return (
    <EditLoyaltyLedgerShell
      customerId={customerId}
      entryId={ledgerId}
      placement="loyalty-menu"
    />
  );
}
