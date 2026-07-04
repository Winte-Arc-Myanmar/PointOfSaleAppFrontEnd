import { ModifierGroupList } from "@/features/modifier-groups/presentation/ModifierGroupList";
import { Shell } from "@/presentation/components/layout/Shell";

export default function ModifierGroupsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Build reusable modifier groups and attach them to products for POS option selection.
        </p>
        <section>
          <h2 className="section-label mb-4">Modifier groups</h2>
          <ModifierGroupList />
        </section>
      </div>
    </Shell>
  );
}
