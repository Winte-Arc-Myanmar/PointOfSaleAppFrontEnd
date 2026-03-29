/**
 * Location entity (warehouse / store / zone hierarchy).
 */

export interface Location {
  id: string;
  tenantId: string;
  parentLocationId: string | null;
  name: string;
  type: string;
  deletedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface LocationTreeNode extends Location {
  subLocations?: LocationTreeNode[];
}
