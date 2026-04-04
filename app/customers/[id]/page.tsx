import { Shell } from "@/presentation/components/layout/Shell";
import { CustomerDetail } from "@/features/customers/presentation/CustomerDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <CustomerDetail customerId={id} />
    </Shell>
  );
}

