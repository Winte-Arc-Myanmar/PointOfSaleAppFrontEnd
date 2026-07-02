"use client";

import { useMemo, useState } from "react";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useFixedAssets } from "@/presentation/hooks/useFixedAssets";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { DepreciationScheduleList } from "./DepreciationScheduleList";

const ASSET_LIST_LIMIT = 200;

export function DepreciationSchedulesPageWithAssetSelect() {
  const { data: assetsData, isLoading } = useFixedAssets({
    page: 1,
    limit: ASSET_LIST_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const assets = getPaginatedItems(assetsData);
  const [selectedId, setSelectedId] = useState<string>("");

  const sorted = useMemo(
    () => [...assets].sort((a, b) => (a.assetName ?? "").localeCompare(b.assetName ?? "")),
    [assets]
  );

  return (
    <div className="space-y-6">
      <div className="grid max-w-md gap-2">
        <Label htmlFor="fixed-asset-select">Fixed asset</Label>
        <Select value={selectedId} onValueChange={setSelectedId} disabled={isLoading}>
          <SelectTrigger id="fixed-asset-select">
            <SelectValue
              placeholder={isLoading ? "Loading assets..." : "Select fixed asset"}
            />
          </SelectTrigger>
          <SelectContent>
            {sorted.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>
                {a.assetName} — {a.serialNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedId ? (
        <DepreciationScheduleList fixedAssetId={selectedId} />
      ) : (
        <p className="text-sm text-muted">
          Select a fixed asset to view and manage its depreciation schedules.
        </p>
      )}
    </div>
  );
}
