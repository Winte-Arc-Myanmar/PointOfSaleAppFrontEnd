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
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Products
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Sample feature: products list and create form
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Product</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateProductForm />
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Product List</h2>
          <ProductList />
        </div>
      </div>
    </Shell>
  );
}
