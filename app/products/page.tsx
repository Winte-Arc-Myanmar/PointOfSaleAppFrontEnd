/**
 * Products page - SSR shell, client content.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { ProductList } from "@/features/products/presentation/ProductList";
import { CreateProductForm } from "@/features/products/presentation/CreateProductForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";

export default function ProductsPage() {
  return (
    <Shell>
      <div className="space-y-8">
        <p className="text-matte-white/70">
          Manage your product catalog. Add products and view the list below.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Add Product</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateProductForm />
          </CardContent>
        </Card>

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
