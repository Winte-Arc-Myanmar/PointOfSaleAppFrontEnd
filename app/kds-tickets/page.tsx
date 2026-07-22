import { Shell } from "@/presentation/components/layout/Shell";
import { KdsTicketList } from "@/features/kds-tickets/presentation/KdsTicketList";

export default function KdsTicketsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage KDS tickets.</p>
        <section>
          <h2 className="section-label mb-4">KDS Tickets</h2>
          <KdsTicketList />
        </section>
      </div>
    </Shell>
  );
}
