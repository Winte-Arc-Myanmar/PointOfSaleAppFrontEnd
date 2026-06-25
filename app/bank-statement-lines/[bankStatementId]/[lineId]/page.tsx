import { Shell } from "@/presentation/components/layout/Shell";
import { BankStatementLineDetail } from "@/features/bank-statement-lines/presentation/BankStatementLineDetail";

interface PageProps {
  params: Promise<{ bankStatementId: string; lineId: string }>;
}

export default async function BankStatementLineDetailPage({ params }: PageProps) {
  const { bankStatementId, lineId } = await params;
  return (
    <Shell>
      <BankStatementLineDetail bankStatementId={bankStatementId} lineId={lineId} />
    </Shell>
  );
}
