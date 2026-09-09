/**
 * DTOs for membership card template API request/response.
 * Application layer - matches backend contract.
 */

export interface MembershipCardTemplateDto {
  id?: string;
  tenantId: string;
  categoryId: string;
  name: string;
  tier: string;
  /** App layer uses number; repository sends API decimal string on write. */
  amount: number;
  billingPeriod: string;
  durationMonths?: number | null;
  rules?: string;
  benefits?: string;
  isActive?: boolean;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  category?: {
    id?: string;
    name?: string;
  };
}
