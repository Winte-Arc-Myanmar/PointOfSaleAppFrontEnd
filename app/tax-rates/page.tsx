import { Shell } from "@/presentation/components/layout/Shell";
import { TaxRateList } from "@/features/tax-rates/presentation/TaxRateList";

export default function TaxRatesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Configure tax rates with percentage values and linked GL liability accounts.
        </p>
        <section>
          <h2 className="section-label mb-4">Tax rates</h2>
          <TaxRateList />
        </section>
      </div>
    </Shell>
  );
}
