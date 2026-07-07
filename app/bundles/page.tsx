import { BundleList } from "@/features/bundles/presentation/BundleList";
import { Shell } from "@/presentation/components/layout/Shell";

export default function BundlesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Create combo bundles linked to products and define component variants for POS selling.
        </p>
        <section>
          <h2 className="section-label mb-4">Bundles</h2>
          <BundleList />
        </section>
      </div>
    </Shell>
  );
}
