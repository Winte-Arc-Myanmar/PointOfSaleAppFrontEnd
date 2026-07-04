import { Shell } from "@/presentation/components/layout/Shell";
import { EditDiscountReasonForm } from "@/features/discount-reasons/presentation/EditDiscountReasonForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DiscountReasonEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditDiscountReasonForm discountReasonId={id} />
    </Shell>
  );
}
