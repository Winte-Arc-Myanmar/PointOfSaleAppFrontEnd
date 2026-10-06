"use client";

import Link from "next/link";
import { BarChart3, CreditCard } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { DetailSection, DetailRows, DetailPageHeader, formatDate } from "@/presentation/components/detail";
import { useClosePosSession, usePosSession, usePosSessionSummary } from "@/presentation/hooks/usePosSessions";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import { useToast } from "@/presentation/providers/ToastProvider";

function money(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function PosSessionDetail({ sessionId }: { sessionId: string }) {
  const { t } = useLanguage();
  const toast = useToast();
  const { data: session, isLoading, error } = usePosSession(sessionId);
  const { data: summary, isLoading: summaryLoading } = usePosSessionSummary(sessionId);
  const close = useClosePosSession();

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading..." />;
  if (error || !session) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">{t("shifts.notFound")}</p>
        <Link href="/pos-sessions">
          <Button variant="outline">{t("shifts.back")}</Button>
        </Link>
      </div>
    );
  }

  const isOpen = session.status === "OPEN";
  const till = summary?.registerName || session.registerName || session.registerId;
  const cashier = summary?.cashierName || session.cashierName || session.cashierId;

  const endShift = () =>
    close.mutate(
      { id: sessionId, data: {} },
      {
        onSuccess: () => toast.success(t("shifts.ended")),
        onError: () => toast.error(t("shifts.endFailed")),
      }
    );

  return (
    <div className="space-y-6">
      <DetailPageHeader backHref="/pos-sessions" backLabel={t("shifts.back")} title={`${till} · ${cashier}`} />

      {summaryLoading ? (
        <AppLoader fullScreen={false} size="sm" message="Loading..." />
      ) : summary ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DetailSection title={t("shifts.sales")} icon={BarChart3}>
            <DetailRows
              rows={[
                { label: t("shifts.opened"), value: formatDate(session.openedAt ?? undefined) },
                { label: t("shifts.closed"), value: isOpen ? t("shifts.open") : formatDate(session.closedAt ?? undefined) },
                { label: t("shifts.salesCount"), value: String(summary.salesCount) },
                { label: t("shifts.sales"), value: money(summary.totalSales) },
                { label: t("shifts.refunds"), value: `${money(summary.totalRefunds)} (${summary.refundCount})` },
                { label: t("shifts.net"), value: money(summary.netTotal) },
              ]}
            />
          </DetailSection>
          <DetailSection title={t("shifts.byPayment")} icon={CreditCard}>
            {summary.paymentBreakdown.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="py-1 font-medium"></th>
                    <th className="py-1 text-right font-medium">{t("shifts.payments")}</th>
                    <th className="py-1 text-right font-medium">{t("shifts.sales")}</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.paymentBreakdown.map((row) => (
                    <tr key={row.methodName} className="border-t border-border">
                      <td className="py-2 text-foreground">{row.methodName}</td>
                      <td className="py-2 text-right tabular-nums text-muted">{row.transactionCount}</td>
                      <td className="py-2 text-right font-medium tabular-nums text-foreground">
                        {money(row.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-muted">{t("shifts.noPayments")}</p>
            )}
          </DetailSection>
        </div>
      ) : null}

      {isOpen ? (
        <div className="rounded-lg border border-border p-4 space-y-2">
          <Button type="button" variant="destructive" disabled={close.isPending} onClick={endShift}>
            {close.isPending ? t("shifts.ending") : t("shifts.endShift")}
          </Button>
          <p className="text-xs text-muted">{t("shifts.endHint")}</p>
        </div>
      ) : null}
    </div>
  );
}
