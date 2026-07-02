import { Shell } from "@/presentation/components/layout/Shell";
import { DepreciationSchedulesPageWithAssetSelect } from "@/features/depreciation-schedules/presentation/DepreciationSchedulesPageWithAssetSelect";

export default function DepreciationSchedulesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Plan and track periodic depreciation entries for fixed assets.
        </p>
        <section>
          <h2 className="section-label mb-4">Depreciation schedules</h2>
          <DepreciationSchedulesPageWithAssetSelect />
        </section>
      </div>
    </Shell>
  );
}
