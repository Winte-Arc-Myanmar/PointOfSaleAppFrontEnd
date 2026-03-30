/**
 * Location API DTO (flat and tree responses).
 */

export interface LocationDto {
  id?: string;
  tenantId: string;
  parentLocationId?: string | null;
  name: string;
  type: string;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  subLocations?: LocationDto[];
}
