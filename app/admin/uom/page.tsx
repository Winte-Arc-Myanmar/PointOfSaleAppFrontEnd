/**
 * UOM page - Classes and Units in one view. system_admin only.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { UomClassList } from "@/features/uom-classes/presentation/UomClassList";
import { UomList } from "@/features/uoms/presentation/UomList";

export default function UomPage() {
  return (
    <Shell>
      <div className="space-y-8">
        <p className="page-description">
          Manage UOM classes (e.g. Weight, Volume) and units of measure (e.g. Kilogram, Piece).
        </p>
        <section>
          <h2 className="section-label mb-4">UOM Classes</h2>
          <UomClassList />
        </section>
        <section>
          <h2 className="section-label mb-4">UOMs</h2>
          <UomList />
        </section>
      </div>
    </Shell>
  );
}
