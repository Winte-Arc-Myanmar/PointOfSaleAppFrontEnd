import { Shell } from "@/presentation/components/layout/Shell";
import { EditPosRegisterForm } from "@/features/pos-registers/presentation/EditPosRegisterForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PosRegisterEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditPosRegisterForm registerId={id} />
    </Shell>
  );
}

