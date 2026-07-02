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
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type KdsStationCreateDto = Pick<
  KdsStationDto,
  "tenantId" | "locationId" | "name" | "displayColor" | "routingRules"
>;

export type KdsStationUpdateDto = Pick<
  KdsStationDto,
  "locationId" | "name" | "displayColor" | "routingRules"
>;
