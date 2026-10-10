import { Shell } from "@/presentation/components/layout/Shell";
import { UploadsList } from "@/features/uploads/presentation/UploadsList";

export default function UploadsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <section>
          <h2 className="section-label mb-4">Uploaded files</h2>
          <UploadsList />
        </section>
      </div>
    </Shell>
  );
}
