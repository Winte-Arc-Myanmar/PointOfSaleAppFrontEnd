import { TipPoolDetail } from "@/features/tip-pools/presentation/TipPoolDetail";
import { Shell } from "@/presentation/components/layout/Shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TipPoolDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <TipPoolDetail poolId={id} />
    </Shell>
  );
}
