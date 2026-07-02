import { Shell } from "@/presentation/components/layout/Shell";
import { SectionList } from "@/features/sections/presentation/SectionList";

export default function SectionsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Manage service sections by location, assign waiter coverage, and link dining tables.
        </p>
        <section>
          <h2 className="section-label mb-4">Sections</h2>
          <SectionList />
        </section>
      </div>
    </Shell>
  );
}
