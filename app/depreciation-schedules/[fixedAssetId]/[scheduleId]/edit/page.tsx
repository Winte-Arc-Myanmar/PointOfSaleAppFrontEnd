import { Shell } from "@/presentation/components/layout/Shell";
import { EditDepreciationScheduleForm } from "@/features/depreciation-schedules/presentation/EditDepreciationScheduleForm";

interface PageProps {
  params: Promise<{ fixedAssetId: string; scheduleId: string }>;
}

export default async function EditDepreciationSchedulePage({ params }: PageProps) {
  const { fixedAssetId, scheduleId } = await params;
  return (
    <Shell>
      <EditDepreciationScheduleForm fixedAssetId={fixedAssetId} scheduleId={scheduleId} />
    </Shell>
  );
}
