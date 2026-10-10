import { WaitlistList } from "@/features/waitlist/presentation/WaitlistList";
import { Shell } from "@/presentation/components/layout/Shell";

export default function WaitlistPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <section>
          <h2 className="section-label mb-4">Waitlist</h2>
          <WaitlistList />
        </section>
      </div>
    </Shell>
  );
}
