"use client";

import Link from "next/link";
import { CalendarClock, Info } from "lucide-react";
import { useDepreciationSchedule } from "@/presentation/hooks/useDepreciationSchedules";
import { useFixedAsset } from "@/presentation/hooks/useFixedAssets";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function DepreciationScheduleDetail({
  fixedAssetId,
  scheduleId,
}: {
  fixedAssetId: string;
  scheduleId: string;
}) {
  const { data: schedule, isLoading, error } = useDepreciationSchedule(
    fixedAssetId,
    scheduleId
  );
  const { data: asset } = useFixedAsset(fixedAssetId);

  if (isLoading)
    return <AppLoader fullScreen={false} size="md" message="Loading depreciation schedule..." />;
  if (error || !schedule) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Depreciation schedule not found or failed to load.</p>
        <Link href={`/depreciation-schedules/${fixedAssetId}`}>
          <Button variant="outline">Back to Depreciation Schedules</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Schedule ID", value: safeText(schedule.id), mono: true },
    { label: "Asset ID", value: safeText(schedule.assetId), mono: true },
    { label: "Scheduled date", value: formatDate(schedule.scheduledDate) },
    { label: "Depreciation amount", value: safeText(schedule.depreciationAmount), mono: true },
    { label: "Posted", value: schedule.isPosted ? "Yes" : "No" },
    {
      label: "Posted journal entry ID",
      value: safeText(schedule.postedJournalEntryId ?? "—"),
      mono: true,
    },
  ];

  const assetRows = asset
    ? [
        { label: "Asset name", value: safeText(asset.assetName) },
        { label: "Serial number", value: safeText(asset.serialNumber), mono: true },
        { label: "Purchase cost", value: safeText(asset.purchaseCost), mono: true },
      ]
    : [];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref={`/depreciation-schedules/${fixedAssetId}`}
        backLabel="Depreciation Schedules"
        title={`Schedule ${formatDate(schedule.scheduledDate)}`}
        editHref={`/depreciation-schedules/${fixedAssetId}/${schedule.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Schedule details" icon={CalendarClock}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        {assetRows.length > 0 && (
          <DetailSection title="Fixed asset" icon={Info}>
            <DetailRows rows={assetRows} />
          </DetailSection>
        )}
      </div>
    </div>
  );
}
