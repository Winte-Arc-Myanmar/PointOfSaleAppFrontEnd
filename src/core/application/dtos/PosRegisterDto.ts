/**
 * DTOs for POS register API request/response.
 */

export interface PosRegisterDto {
  id?: string;
  tenantId: string;
  locationId: string;
  name: string;
  macAddress: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

