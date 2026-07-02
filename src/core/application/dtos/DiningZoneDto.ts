export interface DiningZoneDto {
  id?: string;
  tenantId: string;
  name: string;
  layoutSvg: string;
  sortOrder: number;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type DiningZoneCreateDto = Pick<
  DiningZoneDto,
  "tenantId" | "name" | "layoutSvg" | "sortOrder"
>;

export type DiningZoneUpdateDto = Pick<DiningZoneDto, "name" | "layoutSvg" | "sortOrder">;
