import { Shell } from "@/presentation/components/layout/Shell";
import { TenantList } from "@/features/tenants/presentation/TenantList";

export default function TenantsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage tenants.</p>
        <section>
          <h2 className="section-label mb-4">Tenants</h2>
          <TenantList />
        </section>
      </div>
    </Shell>
  );
}
