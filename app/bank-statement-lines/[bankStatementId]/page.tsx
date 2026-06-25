import { BankStatementLinesListShell } from "@/features/bank-statement-lines/presentation/BankStatementLinesListShell";

interface PageProps {
  params: Promise<{ bankStatementId: string }>;
}

export default async function BankStatementLinesForStatementPage({ params }: PageProps) {
  const { bankStatementId } = await params;
  return <BankStatementLinesListShell bankStatementId={bankStatementId} />;
}
