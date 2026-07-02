import { Shell } from "@/presentation/components/layout/Shell";
import { DiningTableList } from "@/features/dining-tables/presentation/DiningTableList";

export default function DiningTablesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Live floor plan for hosts and servers — tap tables to change status, filter by zone, or switch to list view.
        </p>
        <section>
          <h2 className="section-label mb-4">Table floor</h2>
          <DiningTableList />
        </section>
      </div>
    </Shell>
  );
}
