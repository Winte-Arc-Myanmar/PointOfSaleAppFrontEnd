import { Shell } from "@/presentation/components/layout/Shell";
import { UomDetail } from "@/features/uoms/presentation/UomDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UomDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <UomDetail uomId={id} />
    </Shell>
  );
}
