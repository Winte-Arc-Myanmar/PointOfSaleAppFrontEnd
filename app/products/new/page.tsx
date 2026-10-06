import { Shell } from "@/presentation/components/layout/Shell";
import { QuickProductForm } from "@/features/products/presentation/quick/QuickProductForm";

export default function NewProductPage() {
  return (
    <Shell>
      <QuickProductForm type="menu" />
    </Shell>
  );
}
