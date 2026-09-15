import { Shell } from "@/presentation/components/layout/Shell";
import { CardTierDetail } from "@/features/card-tiers/presentation/CardTierDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CardTierDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <CardTierDetail cardTierId={id} />
    </Shell>
  );
}
