import { PricingScheduleDetail } from "@/features/pricing-schedules/presentation/PricingScheduleDetail";
import { Shell } from "@/presentation/components/layout/Shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PricingScheduleDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <PricingScheduleDetail scheduleId={id} />
    </Shell>
  );
}
