import { Shell } from "@/presentation/components/layout/Shell";
import { UomClassDetail } from "@/features/uom-classes/presentation/UomClassDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UomClassDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <UomClassDetail uomClassId={id} />
    </Shell>
  );
}
