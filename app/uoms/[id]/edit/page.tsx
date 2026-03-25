import { Shell } from "@/presentation/components/layout/Shell";
import { EditUomForm } from "@/features/uoms/presentation/EditUomForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UomEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditUomForm uomId={id} />
    </Shell>
  );
}
