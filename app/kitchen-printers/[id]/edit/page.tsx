import { Shell } from "@/presentation/components/layout/Shell";
import { EditKitchenPrinterForm } from "@/features/kitchen-printers/presentation/EditKitchenPrinterForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditKitchenPrinterPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditKitchenPrinterForm printerId={id} />
    </Shell>
  );
}
