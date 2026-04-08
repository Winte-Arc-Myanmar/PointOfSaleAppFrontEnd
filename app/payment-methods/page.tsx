import { Shell } from "@/presentation/components/layout/Shell";
import { PaymentMethodList } from "@/features/payment-methods/presentation/PaymentMethodList";

export default function PaymentMethodsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Create and manage payment methods (Cash, Card, etc.).</p>
        <section>
          <h2 className="section-label mb-4">Payment methods</h2>
          <PaymentMethodList />
        </section>
      </div>
    </Shell>
  );
}

