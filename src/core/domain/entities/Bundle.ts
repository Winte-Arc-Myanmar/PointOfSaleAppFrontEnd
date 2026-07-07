import type { Id } from "@/core/domain/types";

export interface BundleComponent {
  id?: Id;
  bundleId?: string;
  variantId: string;
  quantity: number;
  swapGroupId?: string | null;
}

export interface Bundle {
  id: Id;
  tenantId: string;
  productId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  components?: BundleComponent[];
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
