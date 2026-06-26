import { Shell } from "@/presentation/components/layout/Shell";
import { FixedAssetDetail } from "@/features/fixed-assets/presentation/FixedAssetDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FixedAssetDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <FixedAssetDetail fixedAssetId={id} />
    </Shell>
  );
}
