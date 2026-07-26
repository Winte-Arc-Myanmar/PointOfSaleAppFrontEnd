import { Shell } from "@/presentation/components/layout/Shell";
import { PurchaseRequisitionDetail } from "@/features/purchase-requisitions/presentation/PurchaseRequisitionDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PurchaseRequisitionDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <PurchaseRequisitionDetail purchaseRequisitionId={id} />
    </Shell>
  );
}
