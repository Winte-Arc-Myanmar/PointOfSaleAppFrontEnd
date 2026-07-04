import type { Id } from "@/core/domain/types";

export interface ModifierGroup {
  id: Id;
  tenantId: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  isRequired: boolean;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Modifier {
  id: Id;
  modifierGroupId: string;
  name: string;
  priceDelta: string;
  sortOrder: number;
  isDefault: boolean;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
