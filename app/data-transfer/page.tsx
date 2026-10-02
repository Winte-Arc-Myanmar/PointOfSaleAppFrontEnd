import { Shell } from "@/presentation/components/layout/Shell";
import { DataTransferHub } from "@/features/data-transfer/presentation/DataTransferHub";

export default function DataTransferPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Move data in and out with Excel: download a template or the current data, fill it
          in, and upload it to see a preview before anything is saved.
        </p>
        <DataTransferHub />
      </div>
    </Shell>
  );
}
