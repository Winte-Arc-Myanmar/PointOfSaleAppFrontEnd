import { ModifierGroupDetail } from "@/features/modifier-groups/presentation/ModifierGroupDetail";
import { Shell } from "@/presentation/components/layout/Shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModifierGroupDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <ModifierGroupDetail modifierGroupId={id} />
    </Shell>
  );
}
