import { Shell } from "@/presentation/components/layout/Shell";
import { DiningTableList } from "@/features/dining-tables/presentation/DiningTableList";

export default function DiningTablesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <section>
          <h2 className="section-label mb-4">Table floor</h2>
          <DiningTableList />
        </section>
      </div>
    </Shell>
  );
}
