import { Shell } from "@/presentation/components/layout/Shell";
import { EditReservationForm } from "@/features/reservations/presentation/EditReservationForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReservationPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditReservationForm reservationId={id} />
    </Shell>
  );
}
