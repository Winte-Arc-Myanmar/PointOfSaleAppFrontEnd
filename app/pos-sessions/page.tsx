import { Shell } from "@/presentation/components/layout/Shell";
import { PosSessionList } from "@/features/pos-sessions/presentation/PosSessionList";

export default function PosSessionsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Open, close, and audit POS sessions.</p>
        <section>
          <h2 className="section-label mb-4">POS sessions</h2>
          <PosSessionList />
        </section>
      </div>
    </Shell>
  );
}

