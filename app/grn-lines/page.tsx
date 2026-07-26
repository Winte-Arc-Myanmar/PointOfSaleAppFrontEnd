import { Shell } from "@/presentation/components/layout/Shell";
import { GrnLinesPageWithGrnSelect } from "@/features/grn-lines/presentation/GrnLinesPageWithGrnSelect";

export default function GrnLinesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage GRN lines.</p>
        <section>
          <h2 className="section-label mb-4">GRN lines</h2>
          <GrnLinesPageWithGrnSelect />
        </section>
      </div>
    </Shell>
  );
}
