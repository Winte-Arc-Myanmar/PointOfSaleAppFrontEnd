import { WaitlistList } from "@/features/waitlist/presentation/WaitlistList";
import { Shell } from "@/presentation/components/layout/Shell";

export default function WaitlistPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage waitlist.</p>
        <section>
          <h2 className="section-label mb-4">Waitlist</h2>
          <WaitlistList />
        </section>
      </div>
    </Shell>
  );
}
