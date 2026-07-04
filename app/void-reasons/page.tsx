import { VoidReasonList } from "@/features/void-reasons/presentation/VoidReasonList";
import { Shell } from "@/presentation/components/layout/Shell";

export default function VoidReasonsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Configure void reasons for order cancellations and line-item voids at the POS.
        </p>
        <section>
          <h2 className="section-label mb-4">Void reasons</h2>
          <VoidReasonList />
        </section>
      </div>
    </Shell>
  );
}
