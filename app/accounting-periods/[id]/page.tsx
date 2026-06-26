import { Shell } from "@/presentation/components/layout/Shell";
import { AccountingPeriodDetail } from "@/features/accounting-periods/presentation/AccountingPeriodDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountingPeriodDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <AccountingPeriodDetail accountingPeriodId={id} />
    </Shell>
  );
}
