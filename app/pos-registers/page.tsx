import { Shell } from "@/presentation/components/layout/Shell";
import { PosRegisterList } from "@/features/pos-registers/presentation/PosRegisterList";

export default function PosRegistersPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage POS registers for each location.</p>
        <section>
          <h2 className="section-label mb-4">POS registers</h2>
          <PosRegisterList />
        </section>
      </div>
    </Shell>
  );
}

