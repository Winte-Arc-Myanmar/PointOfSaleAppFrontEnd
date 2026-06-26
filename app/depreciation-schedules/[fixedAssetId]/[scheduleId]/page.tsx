import { Shell } from "@/presentation/components/layout/Shell";
import { DepreciationScheduleDetail } from "@/features/depreciation-schedules/presentation/DepreciationScheduleDetail";

interface PageProps {
  params: Promise<{ fixedAssetId: string; scheduleId: string }>;
}

export default async function DepreciationScheduleDetailPage({ params }: PageProps) {
  const { fixedAssetId, scheduleId } = await params;
  return (
    <Shell>
      <DepreciationScheduleDetail fixedAssetId={fixedAssetId} scheduleId={scheduleId} />
    </Shell>
  );
}
