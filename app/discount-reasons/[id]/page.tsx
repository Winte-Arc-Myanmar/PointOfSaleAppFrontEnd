import { Shell } from "@/presentation/components/layout/Shell";
import { DiscountReasonDetail } from "@/features/discount-reasons/presentation/DiscountReasonDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DiscountReasonDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <DiscountReasonDetail discountReasonId={id} />
    </Shell>
  );
}
