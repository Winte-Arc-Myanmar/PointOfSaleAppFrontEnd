import { Shell } from "@/presentation/components/layout/Shell";
import { CustomerList } from "@/features/customers/presentation/CustomerList";

export default function CustomersPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage customers.</p>
        <section>
          <h2 className="section-label mb-4">Customers</h2>
          <CustomerList />
        </section>
      </div>
    </Shell>
  );
}

