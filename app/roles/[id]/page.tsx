import { Shell } from "@/presentation/components/layout/Shell";
import { RoleDetail } from "@/features/roles/presentation/RoleDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoleDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <RoleDetail roleId={id} />
    </Shell>
  );
}

