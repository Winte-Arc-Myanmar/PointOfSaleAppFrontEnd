/**
 * Tenants page - system_admin only. Middleware redirects others to /products.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { TenantList } from "@/features/tenants/presentation/TenantList";

export default function TenantsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="text-matte-white/70">
          Manage tenants. Only system administrators can access this section.
        </p>
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-matte-white/60">
            Tenants
          </h2>
          <TenantList />
        </section>
      </div>
    </Shell>
  );
}
