import { Shell } from "@/presentation/components/layout/Shell";
import { EditBankStatementForm } from "@/features/bank-statements/presentation/EditBankStatementForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BankStatementEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditBankStatementForm bankStatementId={id} />
    </Shell>
  );
}
