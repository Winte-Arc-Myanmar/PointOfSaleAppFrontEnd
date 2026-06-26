import { DepreciationSchedulesListShell } from "@/features/depreciation-schedules/presentation/DepreciationSchedulesListShell";

interface PageProps {
  params: Promise<{ fixedAssetId: string }>;
}

export default async function DepreciationSchedulesForAssetPage({ params }: PageProps) {
  const { fixedAssetId } = await params;
  return <DepreciationSchedulesListShell fixedAssetId={fixedAssetId} />;
}
