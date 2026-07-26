import { Suspense } from "react";
import { Shell } from "@/presentation/components/layout/Shell";
import { VendorInvoiceList } from "@/features/vendor-invoices/presentation/VendorInvoiceList";
import { AppLoader } from "@/presentation/components/loader";

export default function VendorInvoicesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage vendor invoices.</p>
        <section>
          <h2 className="section-label mb-4">Vendor invoices</h2>
          <Suspense
            fallback={
              <AppLoader fullScreen={false} size="sm" message="Loading..." />
            }
          >
            <VendorInvoiceList />
          </Suspense>
        </section>
      </div>
    </Shell>
  );
}
