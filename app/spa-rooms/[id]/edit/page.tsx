import { Shell } from "@/presentation/components/layout/Shell";
import { EditSpaRoomForm } from "@/features/spa/presentation/EditSpaRoomForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SpaRoomEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditSpaRoomForm roomId={id} />
    </Shell>
  );
}
