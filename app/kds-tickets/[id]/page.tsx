import { Shell } from "@/presentation/components/layout/Shell";
import { KdsTicketDetail } from "@/features/kds-tickets/presentation/KdsTicketDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KdsTicketDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <KdsTicketDetail ticketId={id} />
    </Shell>
  );
}
