import { Shell } from "@/presentation/components/layout/Shell";
import { KitchenPrinterList } from "@/features/kitchen-printers/presentation/KitchenPrinterList";

export default function KitchenPrintersPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Configure kitchen printers by location, network address, and category routing for order
          tickets.
        </p>
        <section>
          <h2 className="section-label mb-4">Kitchen Printers</h2>
          <KitchenPrinterList />
        </section>
      </div>
    </Shell>
  );
}
