import { Shell } from "@/presentation/components/layout/Shell";
import { BranchList } from "@/features/branches/presentation/BranchList";

export default function BranchesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage branches.</p>
        <section>
          <h2 className="section-label mb-4">Branches</h2>
          <BranchList />
        </section>
      </div>
    </Shell>
  );
}
