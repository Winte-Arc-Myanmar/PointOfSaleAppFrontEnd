export interface KdsStationRoutingRulesDto {
  categoryIds: string[];
}

export interface KdsStationDto {
  id?: string;
  tenantId: string;
  locationId: string;
  name: string;
  displayColor: string;
  routingRules: KdsStationRoutingRulesDto;
  printerIds?: string[];
  printerId?: string | null;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type KdsStationCreateDto = Pick<
  KdsStationDto,
  "tenantId" | "locationId" | "name" | "displayColor" | "routingRules" | "printerIds"
>;

export type KdsStationUpdateDto = Pick<
  KdsStationDto,
  "locationId" | "name" | "displayColor" | "routingRules" | "printerIds"
>;
