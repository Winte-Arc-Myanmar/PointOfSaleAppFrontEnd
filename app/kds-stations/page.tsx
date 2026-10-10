import { Shell } from "@/presentation/components/layout/Shell";
import { KdsStationList } from "@/features/kds-stations/presentation/KdsStationList";

export default function KdsStationsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <section>
          <h2 className="section-label mb-4">KDS Stations</h2>
          <KdsStationList />
        </section>
      </div>
    </Shell>
  );
}
