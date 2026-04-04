import { EditLoyaltyLedgerShell } from "@/features/loyalty-ledger/presentation/EditLoyaltyLedgerShell";

interface PageProps {
  params: Promise<{ id: string; ledgerId: string }>;
}

export default async function LoyaltyLedgerEntryEditPage({ params }: PageProps) {
  const { id: customerId, ledgerId } = await params;
  return (
    <EditLoyaltyLedgerShell
      customerId={customerId}
      entryId={ledgerId}
      placement="customer-profile"
    />
  );
}
