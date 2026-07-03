import { Shell } from "@/presentation/components/layout/Shell";
import { ReservationDetail } from "@/features/reservations/presentation/ReservationDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReservationDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <ReservationDetail reservationId={id} />
    </Shell>
  );
}
