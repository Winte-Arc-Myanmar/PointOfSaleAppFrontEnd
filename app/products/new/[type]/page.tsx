import { notFound } from "next/navigation";
import { Shell } from "@/presentation/components/layout/Shell";
import { QuickProductForm } from "@/features/products/presentation/quick/QuickProductForm";
import { isQuickType } from "@/features/products/presentation/quick/quick-product";

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function NewQuickProductPage({ params }: PageProps) {
  const { type } = await params;
  if (!isQuickType(type)) notFound();
  return (
    <Shell>
      <QuickProductForm type={type} />
    </Shell>
  );
}
