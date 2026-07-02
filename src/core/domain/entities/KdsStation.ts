import type { Id } from "@/core/domain/types";

export interface KdsStationRoutingRules {
  categoryIds: string[];
}

export interface KdsStation {
  id: Id;
  tenantId: string;
  locationId: string;
  name: string;
  displayColor: string;
  routingRules: KdsStationRoutingRules;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
