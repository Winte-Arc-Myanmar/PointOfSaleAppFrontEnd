import { Shell } from "@/presentation/components/layout/Shell";
import { EditLocationForm } from "@/features/locations/presentation/EditLocationForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LocationEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditLocationForm locationId={id} />
    </Shell>
  );
}
