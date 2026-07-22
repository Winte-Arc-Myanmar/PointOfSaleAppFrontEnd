import { Shell } from "@/presentation/components/layout/Shell";
import { CheckoutSection } from "@/features/checkout/presentation/CheckoutSection";

export default function CheckoutPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage checkout.</p>
        <CheckoutSection />
      </div>
    </Shell>
  );
}

