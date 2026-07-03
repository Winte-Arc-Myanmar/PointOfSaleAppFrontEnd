import { Shell } from "@/presentation/components/layout/Shell";
import { CounterOrderDetail } from "@/features/counter-orders/presentation/CounterOrderDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CounterOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <CounterOrderDetail orderId={id} />
    </Shell>
  );
}
