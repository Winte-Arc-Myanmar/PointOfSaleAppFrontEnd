import { Shell } from "@/presentation/components/layout/Shell";
import { RefundDetailSection } from "@/features/refunds/presentation/RefundDetailSection";

export default async function RefundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Shell>
      <RefundDetailSection refundId={id} />
    </Shell>
  );
}

