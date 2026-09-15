import { Shell } from "@/presentation/components/layout/Shell";
import { EditCardTierForm } from "@/features/card-tiers/presentation/EditCardTierForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CardTierEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditCardTierForm cardTierId={id} />
    </Shell>
  );
}
