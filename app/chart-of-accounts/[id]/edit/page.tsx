import { Shell } from "@/presentation/components/layout/Shell";
import { EditChartOfAccountForm } from "@/features/chart-of-accounts/presentation/EditChartOfAccountForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChartOfAccountEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditChartOfAccountForm chartOfAccountId={id} />
    </Shell>
  );
}

