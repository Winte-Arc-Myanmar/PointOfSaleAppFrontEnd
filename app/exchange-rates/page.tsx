import { Shell } from "@/presentation/components/layout/Shell";
import { ExchangeRateList } from "@/features/exchange-rates/presentation/ExchangeRateList";

export default function ExchangeRatesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage exchange rates.</p>
        <section>
          <h2 className="section-label mb-4">Exchange rates</h2>
          <ExchangeRateList />
        </section>
      </div>
    </Shell>
  );
}
