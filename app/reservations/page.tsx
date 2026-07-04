import { Shell } from "@/presentation/components/layout/Shell";
import { ReservationList } from "@/features/reservations/presentation/ReservationList";

export default function ReservationsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Manage dine-in reservations and flow them into seated table sessions with linked dining and KDS context.
        </p>
        <section>
          <h2 className="section-label mb-4">Reservations</h2>
          <ReservationList />
        </section>
      </div>
    </Shell>
  );
}
