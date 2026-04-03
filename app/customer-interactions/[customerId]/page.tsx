import { CustomerInteractionsListShell } from "@/features/customer-interactions/presentation/CustomerInteractionsListShell";

interface PageProps {
  params: Promise<{ customerId: string }>;
}

export default async function CustomerInteractionsForCustomerPage({
  params,
}: PageProps) {
  const { customerId } = await params;
  return (
    <CustomerInteractionsListShell
      customerId={customerId}
      placement="interactions-menu"
    />
  );
}
