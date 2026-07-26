import { Shell } from "@/presentation/components/layout/Shell";
import { TransferOrderLineDetail } from "@/features/transfer-order-lines/presentation/TransferOrderLineDetail";

interface PageProps {
  params: Promise<{ transferOrderId: string; lineId: string }>;
}

export default async function TransferOrderLineDetailPage({ params }: PageProps) {
  const { transferOrderId, lineId } = await params;
  return (
    <Shell>
      <TransferOrderLineDetail transferOrderId={transferOrderId} lineId={lineId} />
    </Shell>
  );
}
