import { Shell } from "@/presentation/components/layout/Shell";
import { SalesOrderDetail } from "@/features/sales-orders/presentation/SalesOrderDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SalesOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <SalesOrderDetail salesOrderId={id} />
    </Shell>
  );
}

