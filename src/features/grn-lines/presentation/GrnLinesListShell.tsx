"use client";

import Link from "next/link";
import { Shell } from "@/presentation/components/layout/Shell";
import { Button } from "@/presentation/components/ui/button";
import { DetailPageHeader } from "@/presentation/components/detail";
import { useGoodsReceivedNote } from "@/presentation/hooks/useGoodsReceivedNotes";
import { GrnLineList } from "./GrnLineList";

export function GrnLinesListShell({
  grnId,
}: {
  grnId: string;
}) {
  const { data: note } = useGoodsReceivedNote(grnId);
  const noteLabel = note?.grnNumber?.trim() || grnId;

  return (
    <Shell>
      <div className="space-y-6">
        <DetailPageHeader
          backHref={`/goods-received-notes/${grnId}`}
          backLabel="Goods Received Note"
          title={`Lines — ${noteLabel}`}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/grn-lines">
            <Button variant="outline" size="sm">
              All goods received notes
            </Button>
          </Link>
          <p className="page-description mb-0">
            Lines for: <span className="font-semibold text-foreground">{noteLabel}</span>
          </p>
        </div>
        <section>
          <h2 className="section-label mb-4">GRN lines</h2>
          <GrnLineList grnId={grnId} />
        </section>
      </div>
    </Shell>
  );
}
