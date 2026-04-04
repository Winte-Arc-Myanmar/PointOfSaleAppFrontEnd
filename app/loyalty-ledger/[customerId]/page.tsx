import { LoyaltyLedgerListShell } from "@/features/loyalty-ledger/presentation/LoyaltyLedgerListShell";

interface PageProps {
  params: Promise<{ customerId: string }>;
}

export default async function LoyaltyLedgerCustomerPage({ params }: PageProps) {
  const { customerId } = await params;
  return (
    <LoyaltyLedgerListShell
      customerId={customerId}
      placement="loyalty-menu"
    />
  );
}
