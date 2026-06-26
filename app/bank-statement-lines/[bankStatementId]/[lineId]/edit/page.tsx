import { Shell } from "@/presentation/components/layout/Shell";
import { EditBankStatementLineForm } from "@/features/bank-statement-lines/presentation/EditBankStatementLineForm";

interface PageProps {
  params: Promise<{ bankStatementId: string; lineId: string }>;
}

export default async function BankStatementLineEditPage({ params }: PageProps) {
  const { bankStatementId, lineId } = await params;
  return (
    <Shell>
      <EditBankStatementLineForm bankStatementId={bankStatementId} lineId={lineId} />
    </Shell>
  );
}
