/**
 * User detail page - system_admin only.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { UserDetail } from "@/features/users/presentation/UserDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <UserDetail userId={id} />
    </Shell>
  );
}
