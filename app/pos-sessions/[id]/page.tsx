import { Shell } from "@/presentation/components/layout/Shell";
import { PosSessionDetail } from "@/features/pos-sessions/presentation/PosSessionDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PosSessionDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <PosSessionDetail sessionId={id} />
    </Shell>
  );
}

