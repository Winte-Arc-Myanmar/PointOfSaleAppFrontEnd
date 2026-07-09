import { Shell } from "@/presentation/components/layout/Shell";
import { FixedAssetList } from "@/features/fixed-assets/presentation/FixedAssetList";

export default function FixedAssetsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage fixed assets.</p>
        <section>
          <h2 className="section-label mb-4">Fixed assets</h2>
          <FixedAssetList />
        </section>
      </div>
    </Shell>
  );
}
