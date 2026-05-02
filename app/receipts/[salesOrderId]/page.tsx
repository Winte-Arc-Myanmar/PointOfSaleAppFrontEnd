import { Shell } from "@/presentation/components/layout/Shell";
import { ReceiptSection } from "@/features/receipts/presentation/ReceiptSection";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ salesOrderId: string }>;
}) {
  const { salesOrderId } = await params;
  return (
    <Shell>
      <ReceiptSection salesOrderId={salesOrderId} />
    </Shell>
  );
}

