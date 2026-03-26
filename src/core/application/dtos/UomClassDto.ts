/**
 * DTOs for UOM class API request/response.
 * Application layer - matches backend contract.
 */

export interface UomClassDto {
  id?: string;
  name: string;
  tenantId: string;
}
