import { Shell } from "@/presentation/components/layout/Shell";
import { UomClassList } from "@/features/uom-classes/presentation/UomClassList";

export default function UomClassesPage() {
  return (
    <Shell>
      <div className="space-y-8">
        <p className="page-description">
          Manage UOM classes (e.g. Weight, Volume).
        </p>
        <section>
          <h2 className="section-label mb-4">UOM Classes</h2>
          <UomClassList />
        </section>
      </div>
    </Shell>
  );
}
