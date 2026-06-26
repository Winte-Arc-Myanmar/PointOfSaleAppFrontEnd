import { Shell } from "@/presentation/components/layout/Shell";
import { EditFixedAssetForm } from "@/features/fixed-assets/presentation/EditFixedAssetForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFixedAssetPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditFixedAssetForm fixedAssetId={id} />
    </Shell>
  );
}
