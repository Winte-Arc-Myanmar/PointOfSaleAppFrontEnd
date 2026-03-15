/**
 * Categories page - system_admin only.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { CategoryList } from "@/features/categories/presentation/CategoryList";
import { CategoryTree } from "@/features/categories/presentation/CategoryTree";

export default function CategoriesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Manage categories. Only system administrators can access this section.
        </p>
        <section>
          <h2 className="section-label mb-4">Category tree</h2>
          <CategoryTree />
        </section>
        <section>
          <h2 className="section-label mb-4">Categories</h2>
          <CategoryList />
        </section>
      </div>
    </Shell>
  );
}
