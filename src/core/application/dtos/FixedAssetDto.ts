import type {
  DepreciationMethod,
  FixedAssetStatus,
} from "@/core/domain/entities/FixedAsset";

export interface FixedAssetDto {
  id?: string;
  tenantId: string;
  assetName: string;
  serialNumber: string;
  assetAccountId: string;
  depreciationExpenseAccountId: string;
  accumulatedDepreciationAccountId: string;
  purchaseDate: string;
  purchaseCost: string;
  salvageValue: string;
  usefulLifeMonths: number;
  depreciationMethod: DepreciationMethod;
  status: FixedAssetStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}
