import { Shell } from "@/presentation/components/layout/Shell";
import { EditExtraFeeForm } from "@/features/extra-fees/presentation/EditExtraFeeForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExtraFeeEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditExtraFeeForm feeId={id} />
    </Shell>
  );
}
