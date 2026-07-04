export interface ModifierGroupDto {
  id?: string;
  tenantId: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  isRequired: boolean;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type ModifierGroupCreateDto = Pick<
  ModifierGroupDto,
  "tenantId" | "name" | "minSelection" | "maxSelection" | "isRequired"
>;

export type ModifierGroupUpdateDto = Pick<
  ModifierGroupDto,
  "tenantId" | "name" | "minSelection" | "maxSelection" | "isRequired"
>;

export interface ModifierGroupAttachProductDto {
  productId: string;
  sortOrder?: number;
}

export interface ModifierDto {
  id?: string;
  modifierGroupId: string;
  name: string;
  priceDelta: string;
  sortOrder: number;
  isDefault: boolean;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type ModifierCreateDto = Pick<
  ModifierDto,
  "name" | "priceDelta" | "sortOrder" | "isDefault"
>;

export type ModifierUpdateDto = Pick<
  ModifierDto,
  "name" | "priceDelta" | "sortOrder" | "isDefault"
>;
