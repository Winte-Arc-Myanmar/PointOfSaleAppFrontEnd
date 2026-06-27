import { Shell } from "@/presentation/components/layout/Shell";
import { DiningTableDetail } from "@/features/dining-tables/presentation/DiningTableDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DiningTableDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <DiningTableDetail diningTableId={id} />
    </Shell>
  );
}
