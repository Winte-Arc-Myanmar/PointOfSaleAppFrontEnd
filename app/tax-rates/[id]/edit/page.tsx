import { Shell } from "@/presentation/components/layout/Shell";
import { EditTaxRateForm } from "@/features/tax-rates/presentation/EditTaxRateForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TaxRateEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditTaxRateForm taxRateId={id} />
    </Shell>
  );
}
