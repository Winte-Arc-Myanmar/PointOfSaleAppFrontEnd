import { Shell } from "@/presentation/components/layout/Shell";
import { VoidReasonDetail } from "@/features/void-reasons/presentation/VoidReasonDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VoidReasonDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <VoidReasonDetail voidReasonId={id} />
    </Shell>
  );
}
