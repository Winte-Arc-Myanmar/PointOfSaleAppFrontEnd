import type { Id } from "@/core/domain/types";

export interface VoidReason {
  id: Id;
  tenantId: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  requiresManagerOverride: boolean;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
