import { Shell } from "@/presentation/components/layout/Shell";
import { TaxRateList } from "@/features/tax-rates/presentation/TaxRateList";

export default function TaxRatesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <section>
          <h2 className="section-label mb-4">Tax rates</h2>
          <TaxRateList />
        </section>
      </div>
    </Shell>
  );
}
