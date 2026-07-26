import { Shell } from "@/presentation/components/layout/Shell";
import { GrnLineDetail } from "@/features/grn-lines/presentation/GrnLineDetail";

interface PageProps {
  params: Promise<{ grnId: string; lineId: string }>;
}

export default async function GrnLineDetailPage({ params }: PageProps) {
  const { grnId, lineId } = await params;
  return (
    <Shell>
      <GrnLineDetail grnId={grnId} lineId={lineId} />
    </Shell>
  );
}
