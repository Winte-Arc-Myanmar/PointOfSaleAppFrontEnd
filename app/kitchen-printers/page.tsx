import Link from "next/link";
import { Shell } from "@/presentation/components/layout/Shell";
import { KitchenPrinterList } from "@/features/kitchen-printers/presentation/KitchenPrinterList";
import { Button } from "@/presentation/components/ui/button";

export default function KitchenPrintersPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="page-description">
            Store kitchen printer records, then connect them to a POS terminal.
          </p>
          <Link href="/printer-setup">
            <Button type="button" variant="outline">Open printer setup</Button>
          </Link>
        </div>
        <section>
          <h2 className="section-label mb-4">Kitchen Printers</h2>
          <KitchenPrinterList />
        </section>
      </div>
    </Shell>
  );
}
