import { Shell } from "@/presentation/components/layout/Shell";
import { EditSalesOrderForm } from "@/features/sales-orders/presentation/EditSalesOrderForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SalesOrderEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditSalesOrderForm salesOrderId={id} />
    </Shell>
  );
}

