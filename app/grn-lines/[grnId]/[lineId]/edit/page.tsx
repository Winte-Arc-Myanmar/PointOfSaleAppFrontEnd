import { Shell } from "@/presentation/components/layout/Shell";
import { EditGrnLineForm } from "@/features/grn-lines/presentation/EditGrnLineForm";

interface PageProps {
  params: Promise<{ grnId: string; lineId: string }>;
}

export default async function GrnLineEditPage({ params }: PageProps) {
  const { grnId, lineId } = await params;
  return (
    <Shell>
      <EditGrnLineForm grnId={grnId} lineId={lineId} />
    </Shell>
  );
}
