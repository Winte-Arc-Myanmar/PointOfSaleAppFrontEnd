import { Shell } from "@/presentation/components/layout/Shell";
import { TableSessionList } from "@/features/table-sessions/presentation/TableSessionList";

export default function TableSessionsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Manage dine-in seating sessions, track service state, and complete checkout from table to payment.
        </p>
        <section>
          <h2 className="section-label mb-4">Table sessions</h2>
          <TableSessionList />
        </section>
      </div>
    </Shell>
  );
}
