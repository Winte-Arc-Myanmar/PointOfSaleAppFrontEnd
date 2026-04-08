import { Shell } from "@/presentation/components/layout/Shell";
import { PaymentMethodDetail } from "@/features/payment-methods/presentation/PaymentMethodDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentMethodDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <PaymentMethodDetail paymentMethodId={id} />
    </Shell>
  );
}

