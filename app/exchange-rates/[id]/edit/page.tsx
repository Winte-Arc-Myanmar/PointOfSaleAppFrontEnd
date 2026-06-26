import { Shell } from "@/presentation/components/layout/Shell";
import { EditExchangeRateForm } from "@/features/exchange-rates/presentation/EditExchangeRateForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExchangeRateEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditExchangeRateForm exchangeRateId={id} />
    </Shell>
  );
}
