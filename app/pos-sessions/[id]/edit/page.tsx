import { Shell } from "@/presentation/components/layout/Shell";
import { EditPosSessionForm } from "@/features/pos-sessions/presentation/EditPosSessionForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PosSessionEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditPosSessionForm sessionId={id} />
    </Shell>
  );
}

