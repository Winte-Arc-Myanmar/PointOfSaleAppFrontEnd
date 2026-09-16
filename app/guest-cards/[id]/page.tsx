import { Shell } from "@/presentation/components/layout/Shell";
import { GuestCardDetail } from "@/features/guest-cards/presentation/GuestCardDetail";

export default async function GuestCardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Shell>
      <GuestCardDetail cardId={id} />
    </Shell>
  );
}
