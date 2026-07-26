import { Shell } from "@/presentation/components/layout/Shell";
import { LandedCostAllocationDetail } from "@/features/landed-cost-allocations/presentation/LandedCostAllocationDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LandedCostAllocationDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <LandedCostAllocationDetail allocationId={id} />
    </Shell>
  );
}
