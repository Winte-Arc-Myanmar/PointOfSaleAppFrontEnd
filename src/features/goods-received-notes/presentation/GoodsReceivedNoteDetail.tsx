"use client";

import Link from "next/link";
import { ClipboardCheck, FileText, Info, ListTree } from "lucide-react";
import { useGoodsReceivedNote } from "@/presentation/hooks/useGoodsReceivedNotes";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function GoodsReceivedNoteDetail({ grnId }: { grnId: string }) {
  const { data: note, isLoading, error } = useGoodsReceivedNote(grnId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading goods received note..." />;
  if (error || !note) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Goods received note not found or failed to load.</p>
        <Link href="/goods-received-notes">
          <Button variant="outline">Back to Goods Received Notes</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "GRN ID", value: safeText(note.id), mono: true },
    { label: "Tenant ID", value: safeText(note.tenantId), mono: true },
    { label: "GRN number", value: safeText(note.grnNumber) },
    { label: "Status", value: safeText(note.status) },
    { label: "Purchase order ID", value: safeText(note.purchaseOrderId), mono: true },
    { label: "Receiving location ID", value: safeText(note.receivingLocationId), mono: true },
    { label: "Received by", value: safeText(note.receivedBy), mono: true },
  ];

  const timelineRows = [
    { label: "Received at", value: formatDate(note.receivedAt ?? undefined) },
    { label: "Created at", value: formatDate(note.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(note.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/goods-received-notes"
        backLabel="Goods Received Notes"
        title={safeText(note.grnNumber)}
        editHref={`/goods-received-notes/${note.id}/edit`}
      />

      <div className="flex flex-wrap gap-2">
        <Link href={`/grn-lines/${note.id}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <ListTree className="h-4 w-4" />
            View GRN lines
          </Button>
        </Link>
        <Link
          href={`/vendor-invoices?grnId=${encodeURIComponent(String(note.id))}`}
        >
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Create vendor invoice
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={ClipboardCheck}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Timeline" icon={Info}>
          <DetailRows rows={timelineRows} />
        </DetailSection>
      </div>
    </div>
  );
}
