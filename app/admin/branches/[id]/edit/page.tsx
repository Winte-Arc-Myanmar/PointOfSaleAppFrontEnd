/**
 * Branch edit page - system_admin only.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { EditBranchForm } from "@/features/branches/presentation/EditBranchForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BranchEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditBranchForm branchId={id} />
    </Shell>
  );
}
