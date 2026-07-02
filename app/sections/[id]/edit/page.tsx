import { Shell } from "@/presentation/components/layout/Shell";
import { EditSectionForm } from "@/features/sections/presentation/EditSectionForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSectionPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditSectionForm sectionId={id} />
    </Shell>
  );
}
