import { Shell } from "@/presentation/components/layout/Shell";
import { LocationList } from "@/features/locations/presentation/LocationList";

export default function LocationsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Warehouses, zones, and storage locations — flat list plus server hierarchy tree.
        </p>
        <LocationList />
      </div>
    </Shell>
  );
}
