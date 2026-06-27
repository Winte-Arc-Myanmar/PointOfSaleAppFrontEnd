import { Shell } from "@/presentation/components/layout/Shell";
import { EditDiningZoneForm } from "@/features/dining-zones/presentation/EditDiningZoneForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDiningZonePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditDiningZoneForm diningZoneId={id} />
    </Shell>
  );
}
