import { Shell } from "@/presentation/components/layout/Shell";
import { EditReconciliationMatchForm } from "@/features/reconciliation-matches/presentation/EditReconciliationMatchForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReconciliationMatchPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditReconciliationMatchForm reconciliationMatchId={id} />
    </Shell>
  );
}
