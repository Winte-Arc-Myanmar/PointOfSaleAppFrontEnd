"use client";

import Link from "next/link";
import { Building2, Info } from "lucide-react";
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

export function FixedAssetDetail({ fixedAssetId }: { fixedAssetId: string }) {
  const { data: asset, isLoading, error } = useFixedAsset(fixedAssetId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading fixed asset..." />;
  if (error || !asset) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Fixed asset not found or failed to load.</p>
        <Link href="/fixed-assets">
          <Button variant="outline">Back to Fixed Assets</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Asset ID", value: safeText(asset.id), mono: true },
    { label: "Tenant ID", value: safeText(asset.tenantId), mono: true },
    { label: "Asset name", value: safeText(asset.assetName) },
    { label: "Serial number", value: safeText(asset.serialNumber), mono: true },
    { label: "Purchase date", value: formatDate(asset.purchaseDate) },
    { label: "Purchase cost", value: safeText(asset.purchaseCost), mono: true },
    { label: "Salvage value", value: safeText(asset.salvageValue), mono: true },
    { label: "Useful life (months)", value: String(asset.usefulLifeMonths) },
    { label: "Depreciation method", value: safeText(asset.depreciationMethod) },
    { label: "Status", value: safeText(asset.status) },
  ];

  const accountRows = [
    { label: "Asset account ID", value: safeText(asset.assetAccountId), mono: true },
    {
      label: "Depreciation expense account ID",
      value: safeText(asset.depreciationExpenseAccountId),
      mono: true,
    },
    {
      label: "Accumulated depreciation account ID",
      value: safeText(asset.accumulatedDepreciationAccountId),
      mono: true,
    },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(asset.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(asset.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/fixed-assets"
        backLabel="Fixed Assets"
        title={safeText(asset.assetName)}
        editHref={`/fixed-assets/${asset.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Building2}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <div className="space-y-5">
          <DetailSection title="GL accounts" icon={Building2}>
            <DetailRows rows={accountRows} />
          </DetailSection>
          <DetailSection title="Record info" icon={Info}>
            <DetailRows rows={recordRows} />
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
