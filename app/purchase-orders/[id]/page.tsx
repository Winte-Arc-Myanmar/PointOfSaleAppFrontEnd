import { Shell } from "@/presentation/components/layout/Shell";
import { PurchaseOrderDetail } from "@/features/purchase-orders/presentation/PurchaseOrderDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PurchaseOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <PurchaseOrderDetail purchaseOrderId={id} />
    </Shell>
  );
}
