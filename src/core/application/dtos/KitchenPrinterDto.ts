export interface KitchenPrinterDto {
  id?: string;
  tenantId: string;
  locationId: string;
  name: string;
  ipAddress: string;
  port: number;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type KitchenPrinterCreateDto = Pick<
  KitchenPrinterDto,
  "tenantId" | "locationId" | "name" | "ipAddress" | "port" | "isActive"
>;

export type KitchenPrinterUpdateDto = Pick<
  KitchenPrinterDto,
  "locationId" | "name" | "ipAddress" | "port" | "isActive"
>;

export type KitchenPrinterRouteCategoryDto = {
  categoryId: string;
};
