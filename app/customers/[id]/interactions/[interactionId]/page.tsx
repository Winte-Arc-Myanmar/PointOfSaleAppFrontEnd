import { CustomerInteractionDetailShell } from "@/features/customer-interactions/presentation/CustomerInteractionDetailShell";

interface PageProps {
  params: Promise<{ id: string; interactionId: string }>;
}

export default async function CustomerInteractionDetailNestedPage({
  params,
}: PageProps) {
  const { id: customerId, interactionId } = await params;
  return (
    <CustomerInteractionDetailShell
      customerId={customerId}
      interactionId={interactionId}
      placement="customer-profile"
    />
  );
}
