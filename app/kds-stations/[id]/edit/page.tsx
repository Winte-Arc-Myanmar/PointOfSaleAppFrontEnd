import { Shell } from "@/presentation/components/layout/Shell";
import { EditKdsStationForm } from "@/features/kds-stations/presentation/EditKdsStationForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditKdsStationPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditKdsStationForm stationId={id} />
    </Shell>
  );
}
