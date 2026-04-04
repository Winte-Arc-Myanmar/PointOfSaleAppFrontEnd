import { CustomerInteractionsListShell } from "@/features/customer-interactions/presentation/CustomerInteractionsListShell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerInteractionsNestedPage({
  params,
}: PageProps) {
  const { id: customerId } = await params;
  return (
    <CustomerInteractionsListShell
      customerId={customerId}
      placement="customer-profile"
    />
  );
}
