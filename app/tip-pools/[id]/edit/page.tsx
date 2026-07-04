import { EditTipPoolForm } from "@/features/tip-pools/presentation/EditTipPoolForm";
import { Shell } from "@/presentation/components/layout/Shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTipPoolPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditTipPoolForm poolId={id} />
    </Shell>
  );
}
