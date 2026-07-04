import { EditPricingScheduleForm } from "@/features/pricing-schedules/presentation/EditPricingScheduleForm";
import { Shell } from "@/presentation/components/layout/Shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPricingSchedulePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditPricingScheduleForm scheduleId={id} />
    </Shell>
  );
}
