import { Shell } from "@/presentation/components/layout/Shell";
import { EditDiningTableForm } from "@/features/dining-tables/presentation/EditDiningTableForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDiningTablePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditDiningTableForm diningTableId={id} />
    </Shell>
  );
}
