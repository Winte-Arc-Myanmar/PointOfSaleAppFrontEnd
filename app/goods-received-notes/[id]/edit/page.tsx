import { Shell } from "@/presentation/components/layout/Shell";
import { EditGoodsReceivedNoteForm } from "@/features/goods-received-notes/presentation/EditGoodsReceivedNoteForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GoodsReceivedNoteEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditGoodsReceivedNoteForm grnId={id} />
    </Shell>
  );
}
