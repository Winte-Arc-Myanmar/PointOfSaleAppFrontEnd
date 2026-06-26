import { Shell } from "@/presentation/components/layout/Shell";
import { EditAccountingPeriodForm } from "@/features/accounting-periods/presentation/EditAccountingPeriodForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountingPeriodEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditAccountingPeriodForm accountingPeriodId={id} />
    </Shell>
  );
}
