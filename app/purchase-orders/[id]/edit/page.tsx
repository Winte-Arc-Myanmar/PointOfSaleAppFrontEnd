import { Shell } from "@/presentation/components/layout/Shell";
import { EditPurchaseOrderForm } from "@/features/purchase-orders/presentation/EditPurchaseOrderForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PurchaseOrderEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditPurchaseOrderForm purchaseOrderId={id} />
    </Shell>
  );
}
