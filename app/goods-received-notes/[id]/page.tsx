import { Shell } from "@/presentation/components/layout/Shell";
import { GoodsReceivedNoteDetail } from "@/features/goods-received-notes/presentation/GoodsReceivedNoteDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GoodsReceivedNoteDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <GoodsReceivedNoteDetail grnId={id} />
    </Shell>
  );
}
