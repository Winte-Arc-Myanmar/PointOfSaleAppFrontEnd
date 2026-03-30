import { Shell } from "@/presentation/components/layout/Shell";
import { EditRoleForm } from "@/features/roles/presentation/EditRoleForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoleEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditRoleForm roleId={id} />
    </Shell>
  );
}

