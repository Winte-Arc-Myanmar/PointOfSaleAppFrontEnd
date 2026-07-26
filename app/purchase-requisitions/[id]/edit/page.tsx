import { Shell } from "@/presentation/components/layout/Shell";
import { EditPurchaseRequisitionForm } from "@/features/purchase-requisitions/presentation/EditPurchaseRequisitionForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PurchaseRequisitionEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditPurchaseRequisitionForm purchaseRequisitionId={id} />
    </Shell>
  );
}
