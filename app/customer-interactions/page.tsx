import { Shell } from "@/presentation/components/layout/Shell";
import { CustomerInteractionsPageWithCustomerSelect } from "@/features/customer-interactions/presentation/CustomerInteractionsPageWithCustomerSelect";

export default function CustomerInteractionsHubPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Log and review customer interactions (calls, emails, inquiries, etc.).
        </p>
        <section>
          <h2 className="section-label mb-4">Customer interactions</h2>
          <CustomerInteractionsPageWithCustomerSelect />
        </section>
      </div>
    </Shell>
  );
}
