/**
 * Products page - SSR shell, client content.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { ProductList } from "@/features/products/presentation/ProductList";

export default function ProductsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Manage your product catalog.
        </p>
        <section>
          <h2 className="section-label mb-4">
            Product List
          </h2>
          <ProductList />
        </section>
      </div>
    </Shell>
  );
}
