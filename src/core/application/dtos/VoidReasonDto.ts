export interface VoidReasonDto {
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

export type VoidReasonCreateDto = Pick<
  VoidReasonDto,
  "tenantId" | "code" | "name" | "description" | "isActive" | "requiresManagerOverride"
>;

export type VoidReasonUpdateDto = Pick<
  VoidReasonDto,
  "name" | "description" | "isActive" | "requiresManagerOverride"
>;
