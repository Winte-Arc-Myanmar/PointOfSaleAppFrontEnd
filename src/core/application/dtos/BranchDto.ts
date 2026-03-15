/**
 * DTOs for branch API request/response.
 * Application layer - matches backend contract.
 */

export interface BranchDto {
  id?: string;
  name: string;
  tenantId: string;
  branchCode: string;
  type: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  latitude?: number | unknown;
  longitude?: number | unknown;
  openingHours?: Record<string, string> | null;
  status?: string | null;
  managerId?: string | null;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
