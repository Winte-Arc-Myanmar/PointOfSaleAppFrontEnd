"use client";

import Link from "next/link";
import { Shell } from "@/presentation/components/layout/Shell";
import { Button } from "@/presentation/components/ui/button";
import { useFixedAsset } from "@/presentation/hooks/useFixedAssets";
import { DepreciationScheduleList } from "./DepreciationScheduleList";

export function DepreciationSchedulesListShell({ fixedAssetId }: { fixedAssetId: string }) {
  const { data: asset } = useFixedAsset(fixedAssetId);
  const assetLabel = asset ? asset.assetName : fixedAssetId;

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/depreciation-schedules">
            <Button variant="outline" size="sm">
              All assets
            </Button>
          </Link>
          <Link href={`/fixed-assets/${fixedAssetId}`}>
            <Button variant="outline" size="sm">
              Fixed asset
            </Button>
          </Link>
          <p className="page-description mb-0">
            Schedules for: <span className="font-semibold text-foreground">{assetLabel}</span>
          </p>
        </div>
        <section>
          <h2 className="section-label mb-4">Depreciation schedules</h2>
          <DepreciationScheduleList fixedAssetId={fixedAssetId} />
        </section>
      </div>
    </Shell>
  );
}
