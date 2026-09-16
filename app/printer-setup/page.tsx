import { Shell } from "@/presentation/components/layout/Shell";
import { PrinterSetupPanel } from "@/presentation/components/printer/PrinterSetupPanel";

export default function PrinterSetupPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <p className="page-description">
            Connect receipt and kitchen printers for this POS terminal.
          </p>
          <h2 className="section-label mb-4">Printer setup</h2>
        </div>
        <PrinterSetupPanel />
      </div>
    </Shell>
  );
}
