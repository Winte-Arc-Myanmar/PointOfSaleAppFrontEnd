import { TipPoolList } from "@/features/tip-pools/presentation/TipPoolList";
import { Shell } from "@/presentation/components/layout/Shell";

export default function TipPoolsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Configure tip pools, manage allocations, and settle distribution windows with operational context.
        </p>
        <section>
          <h2 className="section-label mb-4">Tip Pools</h2>
          <TipPoolList />
        </section>
      </div>
    </Shell>
  );
}
