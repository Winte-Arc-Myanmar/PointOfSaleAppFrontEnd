/**
 * Tenant detail page - system_admin only.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { TenantDetail } from "@/features/tenants/presentation/TenantDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <TenantDetail tenantId={id} />
    </Shell>
  );
}
