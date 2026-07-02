import { Shell } from "@/presentation/components/layout/Shell";
import { KdsStationDetail } from "@/features/kds-stations/presentation/KdsStationDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KdsStationDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <KdsStationDetail stationId={id} />
    </Shell>
  );
}
