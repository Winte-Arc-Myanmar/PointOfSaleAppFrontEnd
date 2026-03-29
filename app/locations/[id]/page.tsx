import { Shell } from "@/presentation/components/layout/Shell";
import { LocationDetail } from "@/features/locations/presentation/LocationDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LocationDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <LocationDetail locationId={id} />
    </Shell>
  );
}
