import { BundleDetail } from "@/features/bundles/presentation/BundleDetail";
import { Shell } from "@/presentation/components/layout/Shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BundleDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <BundleDetail bundleId={id} />
    </Shell>
  );
}
