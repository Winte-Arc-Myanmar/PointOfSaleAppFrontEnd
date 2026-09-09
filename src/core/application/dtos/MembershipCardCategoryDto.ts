/**
 * DTOs for membership card category API request/response.
 * Application layer - matches backend contract.
 */

export interface MembershipCardCategoryDto {
  id?: string;
  name: string;
  tenantId: string;
  parentId?: string | null;
  description?: string;
  sortOrder?: number;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  children?: MembershipCardCategoryDto[];
}
