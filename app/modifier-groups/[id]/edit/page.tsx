import { EditModifierGroupForm } from "@/features/modifier-groups/presentation/EditModifierGroupForm";
import { Shell } from "@/presentation/components/layout/Shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditModifierGroupPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditModifierGroupForm modifierGroupId={id} />
    </Shell>
  );
}
