import type { FixedAsset } from "@/core/domain/entities/FixedAsset";
import type { FixedAssetDto } from "../dtos/FixedAssetDto";

export function toFixedAsset(dto: FixedAssetDto & { id: string }): FixedAsset {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    assetName: dto.assetName ?? "",
    serialNumber: dto.serialNumber ?? "",
    assetAccountId: dto.assetAccountId ?? "",
    depreciationExpenseAccountId: dto.depreciationExpenseAccountId ?? "",
    accumulatedDepreciationAccountId: dto.accumulatedDepreciationAccountId ?? "",
    purchaseDate: dto.purchaseDate ?? "",
    purchaseCost: dto.purchaseCost ?? "0.0000",
    salvageValue: dto.salvageValue ?? "0.0000",
    usefulLifeMonths: Number(dto.usefulLifeMonths) || 0,
    depreciationMethod: dto.depreciationMethod ?? "STRAIGHT_LINE",
    status: dto.status ?? "ACTIVE",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toFixedAssetDto(asset: Partial<FixedAsset>): FixedAssetDto {
  return {
    ...(asset.id && { id: String(asset.id) }),
    tenantId: asset.tenantId ?? "",
    assetName: asset.assetName ?? "",
    serialNumber: asset.serialNumber ?? "",
    assetAccountId: asset.assetAccountId ?? "",
    depreciationExpenseAccountId: asset.depreciationExpenseAccountId ?? "",
    accumulatedDepreciationAccountId: asset.accumulatedDepreciationAccountId ?? "",
    purchaseDate: asset.purchaseDate ?? "",
    purchaseCost: asset.purchaseCost ?? "0.0000",
    salvageValue: asset.salvageValue ?? "0.0000",
    usefulLifeMonths: asset.usefulLifeMonths ?? 0,
    depreciationMethod: asset.depreciationMethod ?? "STRAIGHT_LINE",
    status: asset.status ?? "ACTIVE",
  };
}
