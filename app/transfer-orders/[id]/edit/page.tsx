import { Shell } from "@/presentation/components/layout/Shell";
import { EditTransferOrderForm } from "@/features/transfer-orders/presentation/EditTransferOrderForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TransferOrderEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditTransferOrderForm transferOrderId={id} />
    </Shell>
  );
}
