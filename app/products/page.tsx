/**
 * Items & services: everything the shop sells and charges for, one tab per kind.
 */

import { Suspense } from "react";
import { Shell } from "@/presentation/components/layout/Shell";
import { ItemsAndServices } from "@/features/products/presentation/quick/ItemsAndServices";

export default function ProductsPage() {
  return (
    <Shell>
      <Suspense>
        <ItemsAndServices />
      </Suspense>
    </Shell>
  );
}
