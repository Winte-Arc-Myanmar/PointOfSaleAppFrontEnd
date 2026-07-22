import { Shell } from "@/presentation/components/layout/Shell";
import { LocationList } from "@/features/locations/presentation/LocationList";

export default function LocationsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage locations.</p>
        <LocationList />
      </div>
    </Shell>
  );
}
