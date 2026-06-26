import { Shell } from "@/presentation/components/layout/Shell";
import { BankStatementDetail } from "@/features/bank-statements/presentation/BankStatementDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BankStatementDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <BankStatementDetail bankStatementId={id} />
    </Shell>
  );
}
