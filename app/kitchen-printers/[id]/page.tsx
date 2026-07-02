import { Shell } from "@/presentation/components/layout/Shell";
import { KitchenPrinterDetail } from "@/features/kitchen-printers/presentation/KitchenPrinterDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KitchenPrinterDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <KitchenPrinterDetail printerId={id} />
    </Shell>
  );
}
