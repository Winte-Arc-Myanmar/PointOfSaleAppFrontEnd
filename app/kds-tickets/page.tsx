import { Shell } from "@/presentation/components/layout/Shell";
import { KdsTicketList } from "@/features/kds-tickets/presentation/KdsTicketList";

export default function KdsTicketsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Manage kitchen display tickets from fire to ready, including line-level bumping and
          station-based routing.
        </p>
        <section>
          <h2 className="section-label mb-4">KDS Tickets</h2>
          <KdsTicketList />
        </section>
      </div>
    </Shell>
  );
}
