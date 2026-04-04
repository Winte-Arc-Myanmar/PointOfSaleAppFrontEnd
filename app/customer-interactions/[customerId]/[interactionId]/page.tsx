import { CustomerInteractionDetailShell } from "@/features/customer-interactions/presentation/CustomerInteractionDetailShell";

interface PageProps {
  params: Promise<{ customerId: string; interactionId: string }>;
}

export default async function CustomerInteractionDetailSectionPage({
  params,
}: PageProps) {
  const { customerId, interactionId } = await params;
  return (
    <CustomerInteractionDetailShell
      customerId={customerId}
      interactionId={interactionId}
      placement="interactions-menu"
    />
  );
}
