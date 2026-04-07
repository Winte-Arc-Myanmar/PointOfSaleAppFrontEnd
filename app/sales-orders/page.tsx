import { Shell } from "@/presentation/components/layout/Shell";
import { SalesOrderList } from "@/features/sales-orders/presentation/SalesOrderList";

export default function SalesOrdersPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Create, review, and manage sales orders.</p>
        <section>
          <h2 className="section-label mb-4">Sales orders</h2>
          <SalesOrderList />
        </section>
      </div>
    </Shell>
  );
}

