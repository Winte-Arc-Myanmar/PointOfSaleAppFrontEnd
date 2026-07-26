import { Shell } from "@/presentation/components/layout/Shell";
import { EditTransferOrderLineForm } from "@/features/transfer-order-lines/presentation/EditTransferOrderLineForm";

interface PageProps {
  params: Promise<{ transferOrderId: string; lineId: string }>;
}

export default async function TransferOrderLineEditPage({ params }: PageProps) {
  const { transferOrderId, lineId } = await params;
  return (
    <Shell>
      <EditTransferOrderLineForm transferOrderId={transferOrderId} lineId={lineId} />
    </Shell>
  );
}
