"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardList, Info, Wallet, BarChart3 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { useClosePosSession, usePosSession, usePosSessionSummary } from "@/presentation/hooks/usePosSessions";
import { useToast } from "@/presentation/providers/ToastProvider";

function money(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

export function PosSessionDetail({ sessionId }: { sessionId: string }) {
  const toast = useToast();
  const { data: session, isLoading, error } = usePosSession(sessionId);
  const { data: summary, isLoading: summaryLoading } = usePosSessionSummary(sessionId);
  const close = useClosePosSession();

  const [actualClosingCashInput, setActualClosingCashInput] = useState("");

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading session..." />;
  if (error || !session) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">POS session not found or failed to load.</p>
        <Link href="/pos-sessions">
          <Button variant="outline">Back to POS sessions</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Session ID", value: safeText(session.id), mono: true },
    { label: "Status", value: safeText(session.status) },
    { label: "Tenant ID", value: safeText(session.tenantId), mono: true },
    { label: "Register ID", value: safeText(session.registerId), mono: true },
    { label: "Cashier ID", value: safeText(session.cashierId), mono: true },
  ];

  const cashRows = [
    { label: "Opening float", value: money(session.openingCashFloat) },
    { label: "Expected closing cash", value: money(session.expectedClosingCash) },
    { label: "Actual closing cash", value: money(session.actualClosingCash ?? null) },
    { label: "Cash variance", value: money(session.cashVariance ?? null) },
  ];

  const recordRows = [
    { label: "Opened at", value: formatDate(session.openedAt ?? undefined) },
    { label: "Closed at", value: session.closedAt ? formatDate(session.closedAt) : "—" },
    { label: "Updated at", value: formatDate(session.updatedAt ?? undefined) },
  ];

  const onCloseSession = async () => {
    const n = Number(actualClosingCashInput.trim());
    if (!Number.isFinite(n)) {
      toast.error("Enter a valid actual closing cash amount.");
      return;
    }
    close.mutate(
      { id: sessionId, data: { actualClosingCash: n } },
      {
        onSuccess: () => toast.success("Session closed."),
        onError: () => toast.error("Failed to close session."),
      }
    );
  };

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/pos-sessions"
        backLabel="POS sessions"
        title={`Session ${safeText(session.id)}`}
        editHref={`/pos-sessions/${session.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={ClipboardList}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Cash" icon={Wallet}>
          <DetailRows rows={cashRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info} className="lg:col-span-2">
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <div className="rounded-lg border border-border p-4 space-y-3">
        <h2 className="section-label">Close session</h2>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="grid gap-2 w-full sm:w-64">
            <Label>Actual closing cash</Label>
            <Input
              type="number"
              step="0.01"
              value={actualClosingCashInput}
              onChange={(e) => setActualClosingCashInput(e.target.value)}
              placeholder="1500.0000"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            disabled={close.isPending || session.status === "CLOSED"}
            onClick={onCloseSession}
          >
            {session.status === "CLOSED" ? "Already closed" : close.isPending ? "Closing..." : "Close session"}
          </Button>
        </div>
        <p className="text-xs text-muted">
          Uses <code>/pos-sessions/{`{id}`}/close</code> and returns the end-of-day summary.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="section-label flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted" />
          Summary
        </h2>
        {summaryLoading ? (
          <AppLoader fullScreen={false} size="sm" message="Loading summary..." />
        ) : summary ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <DetailSection title="Totals" icon={BarChart3}>
              <DetailRows
                rows={[
                  { label: "Total sales", value: money(summary.totalSales) },
                  { label: "Total refunds", value: money(summary.totalRefunds) },
                  { label: "Net total", value: money(summary.netTotal) },
                  { label: "Sales count", value: String(summary.salesCount) },
                  { label: "Refund count", value: String(summary.refundCount) },
                ]}
              />
            </DetailSection>
            <DetailSection title="Payment breakdown" icon={BarChart3}>
              <pre className="text-xs font-mono text-foreground overflow-auto rounded bg-muted/50 p-3">
                {JSON.stringify(summary.paymentBreakdown ?? [], null, 2)}
              </pre>
            </DetailSection>
          </div>
        ) : (
          <p className="text-sm text-muted">No summary available.</p>
        )}
      </div>
    </div>
  );
}

