import { TransferOrderLinesListShell } from "@/features/transfer-order-lines/presentation/TransferOrderLinesListShell";

interface PageProps {
  params: Promise<{ transferOrderId: string }>;
}

export default async function TransferOrderLinesForOrderPage({ params }: PageProps) {
  const { transferOrderId } = await params;
  return <TransferOrderLinesListShell transferOrderId={transferOrderId} />;
}
