import { EditCustomerInteractionShell } from "@/features/customer-interactions/presentation/EditCustomerInteractionShell";

interface PageProps {
  params: Promise<{ customerId: string; interactionId: string }>;
}

export default async function CustomerInteractionEditSectionPage({
  params,
}: PageProps) {
  const { customerId, interactionId } = await params;
  return (
    <EditCustomerInteractionShell
      customerId={customerId}
      interactionId={interactionId}
      placement="interactions-menu"
    />
  );
}
