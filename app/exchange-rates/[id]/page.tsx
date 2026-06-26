import { Shell } from "@/presentation/components/layout/Shell";
import { ExchangeRateDetail } from "@/features/exchange-rates/presentation/ExchangeRateDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExchangeRateDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <ExchangeRateDetail exchangeRateId={id} />
    </Shell>
  );
}
