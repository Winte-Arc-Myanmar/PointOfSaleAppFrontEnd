import { LoyaltyLedgerListShell } from "@/features/loyalty-ledger/presentation/LoyaltyLedgerListShell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerLoyaltyLedgerPage({ params }: PageProps) {
  const { id: customerId } = await params;
  return (
    <LoyaltyLedgerListShell
      customerId={customerId}
      placement="customer-profile"
    />
  );
}
