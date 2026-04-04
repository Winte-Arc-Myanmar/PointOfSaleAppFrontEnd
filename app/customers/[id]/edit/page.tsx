import { Shell } from "@/presentation/components/layout/Shell";
import { EditCustomerForm } from "@/features/customers/presentation/EditCustomerForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditCustomerForm customerId={id} />
    </Shell>
  );
}

