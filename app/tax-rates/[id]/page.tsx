import { Shell } from "@/presentation/components/layout/Shell";
import { TaxRateDetail } from "@/features/tax-rates/presentation/TaxRateDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TaxRateDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <TaxRateDetail taxRateId={id} />
    </Shell>
  );
}
