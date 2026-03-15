/**
 * Branches page - system_admin only.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { BranchList } from "@/features/branches/presentation/BranchList";

export default function BranchesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Manage branches. Only system administrators can access this section.
        </p>
        <section>
          <h2 className="section-label mb-4">Branches</h2>
          <BranchList />
        </section>
      </div>
    </Shell>
  );
}
