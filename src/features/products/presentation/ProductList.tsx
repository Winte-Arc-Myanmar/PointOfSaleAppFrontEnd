"use client";

import { useProducts } from "@/presentation/hooks/useProducts";
import { Button } from "@/presentation/components/ui/button";

export function ProductList() {
  const { data: products, isLoading, error, refetch } = useProducts();

  if (isLoading) return <p className="text-zinc-500">Loading products...</p>;
  if (error)
    return (
      <div className="space-y-2">
        <p className="text-red-600">
          Failed to load products. Is the backend API running?
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  if (!products?.length)
    return <p className="text-zinc-500">No products yet. Create one above.</p>;

  return (
    <ul className="space-y-2">
      {products.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <span className="font-medium">{p.name}</span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {p.sku} · {p.price.currency} {p.price.amount}
          </span>
        </li>
      ))}
    </ul>
  );
}
