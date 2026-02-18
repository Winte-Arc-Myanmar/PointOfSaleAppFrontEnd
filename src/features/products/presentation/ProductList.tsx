"use client";

import { motion } from "framer-motion";
import { useProducts } from "@/presentation/hooks/useProducts";
import { Button } from "@/presentation/components/ui/button";

export function ProductList() {
  const { data: products, isLoading, error, refetch } = useProducts();

  if (isLoading) return <p className="text-matte-white/70">Loading products...</p>;
  if (error)
    return (
      <div className="space-y-2">
        <p className="text-red-400">
          Failed to load products. Is the backend API running?
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  if (!products?.length)
    return <p className="text-matte-white/70">No products yet. Create one above.</p>;

  return (
    <ul className="space-y-2">
      {products.map((p, i) => (
        <motion.li
          key={p.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.03 }}
          className="flex items-center justify-between rounded-lg border border-mint/20 bg-gloss-black/60 px-4 py-3 transition-colors hover:border-mint/40"
        >
          <span className="font-medium text-matte-white">{p.name}</span>
          <span className="text-sm text-matte-white/80">
            {p.sku} · {p.price.currency} {p.price.amount}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
