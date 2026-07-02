import { Shell } from "@/presentation/components/layout/Shell";
import { EditTableSessionForm } from "@/features/table-sessions/presentation/EditTableSessionForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTableSessionPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditTableSessionForm sessionId={id} />
    </Shell>
  );
}
