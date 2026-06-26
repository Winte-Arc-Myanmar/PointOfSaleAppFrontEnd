import { Shell } from "@/presentation/components/layout/Shell";
import { ReconciliationMatchDetail } from "@/features/reconciliation-matches/presentation/ReconciliationMatchDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReconciliationMatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <ReconciliationMatchDetail reconciliationMatchId={id} />
    </Shell>
  );
}
