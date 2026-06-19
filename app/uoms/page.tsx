import { Shell } from "@/presentation/components/layout/Shell";
import { UomList } from "@/features/uoms/presentation/UomList";

export default function UomsPage() {
  return (
    <Shell>
      <div className="space-y-8">
        <p className="page-description">
          Manage units of measure (e.g. Kilogram, Piece).
        </p>
        <section>
          <h2 className="section-label mb-4">UOMs</h2>
          <UomList />
        </section>
      </div>
    </Shell>
  );
}
