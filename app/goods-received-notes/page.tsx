import { Suspense } from "react";
import { Shell } from "@/presentation/components/layout/Shell";
import { GoodsReceivedNoteList } from "@/features/goods-received-notes/presentation/GoodsReceivedNoteList";
import { AppLoader } from "@/presentation/components/loader";

export default function GoodsReceivedNotesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage goods received notes.</p>
        <section>
          <h2 className="section-label mb-4">Goods received notes</h2>
          <Suspense
            fallback={
              <AppLoader fullScreen={false} size="sm" message="Loading..." />
            }
          >
            <GoodsReceivedNoteList />
          </Suspense>
        </section>
      </div>
    </Shell>
  );
}
