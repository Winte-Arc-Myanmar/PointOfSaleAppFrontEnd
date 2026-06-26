"use client";

import Link from "next/link";
import { GitCompareArrows, Info } from "lucide-react";
import { useReconciliationMatch } from "@/presentation/hooks/useReconciliationMatches";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function ReconciliationMatchDetail({
  reconciliationMatchId,
}: {
  reconciliationMatchId: string;
}) {
  const { data: match, isLoading, error } = useReconciliationMatch(reconciliationMatchId);

  if (isLoading)
    return <AppLoader fullScreen={false} size="md" message="Loading reconciliation match..." />;
  if (error || !match) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Reconciliation match not found or failed to load.</p>
        <Link href="/reconciliation-matches">
          <Button variant="outline">Back to Reconciliation Matches</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Match ID", value: safeText(match.id), mono: true },
    { label: "Statement line ID", value: safeText(match.statementLineId), mono: true },
    { label: "Journal line ID", value: safeText(match.journalLineId), mono: true },
    { label: "Matched by", value: safeText(match.matchedBy), mono: true },
    { label: "Matched at", value: formatDate(match.matchedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/reconciliation-matches"
        backLabel="Reconciliation Matches"
        title={`Match ${safeText(match.id)}`}
        editHref={`/reconciliation-matches/${match.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={GitCompareArrows}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows
            rows={[
              {
                label: "Statement line",
                value: safeText(match.statementLineId),
                mono: true,
              },
              {
                label: "Journal line",
                value: safeText(match.journalLineId),
                mono: true,
              },
            ]}
          />
        </DetailSection>
      </div>
    </div>
  );
}
