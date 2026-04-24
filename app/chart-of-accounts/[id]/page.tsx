import { Shell } from "@/presentation/components/layout/Shell";
import { ChartOfAccountDetail } from "@/features/chart-of-accounts/presentation/ChartOfAccountDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChartOfAccountDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <ChartOfAccountDetail chartOfAccountId={id} />
    </Shell>
  );
}

