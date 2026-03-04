/**
 * Tenant edit page - system_admin only.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { EditTenantForm } from "@/features/tenants/presentation/EditTenantForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditTenantForm tenantId={id} />
    </Shell>
  );
}
