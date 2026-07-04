export interface DiscountReasonDto {
  id?: string;
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

export type DiscountReasonCreateDto = Pick<
  DiscountReasonDto,
  "tenantId" | "code" | "name" | "description" | "isActive" | "requiresManagerOverride"
>;

export type DiscountReasonUpdateDto = Pick<
  DiscountReasonDto,
  "name" | "description" | "isActive" | "requiresManagerOverride"
>;
