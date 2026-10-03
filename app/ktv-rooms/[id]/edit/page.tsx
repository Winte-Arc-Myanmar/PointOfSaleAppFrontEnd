import { Shell } from "@/presentation/components/layout/Shell";
import { EditKtvRoomForm } from "@/features/ktv-rooms/presentation/EditKtvRoomForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KtvRoomEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditKtvRoomForm roomId={id} />
    </Shell>
  );
}
