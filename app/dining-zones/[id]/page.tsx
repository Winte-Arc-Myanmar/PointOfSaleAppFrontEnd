import { Shell } from "@/presentation/components/layout/Shell";
import { DiningZoneDetail } from "@/features/dining-zones/presentation/DiningZoneDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DiningZoneDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <DiningZoneDetail diningZoneId={id} />
    </Shell>
  );
}
