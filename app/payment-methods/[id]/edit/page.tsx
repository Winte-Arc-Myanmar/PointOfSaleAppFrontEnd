import { Shell } from "@/presentation/components/layout/Shell";
import { EditPaymentMethodForm } from "@/features/payment-methods/presentation/EditPaymentMethodForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentMethodEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditPaymentMethodForm paymentMethodId={id} />
    </Shell>
  );
}

