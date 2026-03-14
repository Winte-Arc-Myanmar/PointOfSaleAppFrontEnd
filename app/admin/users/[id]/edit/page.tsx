/**
 * User edit page - system_admin only.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { EditUserForm } from "@/features/users/presentation/EditUserForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditUserForm userId={id} />
    </Shell>
  );
}
