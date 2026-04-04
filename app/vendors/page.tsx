import { Shell } from "@/presentation/components/layout/Shell";
import { VendorList } from "@/features/vendors/presentation/VendorList";

export default function VendorsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage vendors.</p>
        <section>
          <h2 className="section-label mb-4">Vendors</h2>
          <VendorList />
        </section>
      </div>
    </Shell>
  );
}

