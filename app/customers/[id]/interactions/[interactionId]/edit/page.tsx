import { EditCustomerInteractionShell } from "@/features/customer-interactions/presentation/EditCustomerInteractionShell";

interface PageProps {
  params: Promise<{ id: string; interactionId: string }>;
}

export default async function CustomerInteractionEditNestedPage({
  params,
}: PageProps) {
  const { id: customerId, interactionId } = await params;
  return (
    <EditCustomerInteractionShell
      customerId={customerId}
      interactionId={interactionId}
      placement="customer-profile"
    />
  );
}
