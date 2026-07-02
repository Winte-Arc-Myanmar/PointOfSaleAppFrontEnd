import { Shell } from "@/presentation/components/layout/Shell";
import { DiningZoneList } from "@/features/dining-zones/presentation/DiningZoneList";

export default function DiningZonesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Configure dining areas, floor layouts, and quick links to open each floor in the table view.
        </p>
        <section>
          <h2 className="section-label mb-4">Floor zones</h2>
          <DiningZoneList />
        </section>
      </div>
    </Shell>
  );
}
