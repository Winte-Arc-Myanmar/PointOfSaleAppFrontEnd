import { Shell } from "@/presentation/components/layout/Shell";
import { PosRegisterDetail } from "@/features/pos-registers/presentation/PosRegisterDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PosRegisterDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <PosRegisterDetail registerId={id} />
    </Shell>
  );
}

