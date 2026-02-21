/**
 * Products page - SSR shell, client content.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { ProductList } from "@/features/products/presentation/ProductList";

export default function ProductsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="text-matte-white/70">
          Manage your product catalog.
        </p>
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-matte-white/60">
            Product List
          </h2>
          <ProductList />
        </section>
      </div>
    </Shell>
  );
}
