import { Shell } from "@/presentation/components/layout/Shell";
import { EditLandedCostAllocationForm } from "@/features/landed-cost-allocations/presentation/EditLandedCostAllocationForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LandedCostAllocationEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditLandedCostAllocationForm allocationId={id} />
    </Shell>
  );
}
