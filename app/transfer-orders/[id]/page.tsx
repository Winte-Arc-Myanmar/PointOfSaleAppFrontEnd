import { Shell } from "@/presentation/components/layout/Shell";
import { TransferOrderDetail } from "@/features/transfer-orders/presentation/TransferOrderDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TransferOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <TransferOrderDetail transferOrderId={id} />
    </Shell>
  );
}
