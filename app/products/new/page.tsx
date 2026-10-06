import { Shell } from "@/presentation/components/layout/Shell";
import { AddProductChooser } from "@/features/products/presentation/quick/AddProductChooser";

export default function NewProductPage() {
  return (
    <Shell>
      <AddProductChooser />
    </Shell>
  );
}
