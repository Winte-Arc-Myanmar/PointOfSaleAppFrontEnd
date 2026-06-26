import type { Id } from "@/core/domain/types";

export type DepreciationMethod = "STRAIGHT_LINE" | string;
export type FixedAssetStatus = "ACTIVE" | "DISPOSED" | string;

export interface FixedAsset {
  id: Id;
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
