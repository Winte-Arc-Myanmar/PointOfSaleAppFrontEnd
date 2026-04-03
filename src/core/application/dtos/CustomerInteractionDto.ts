/**
 * DTOs for customer interaction API request/response.
 * Application layer - matches backend contract.
 */

export interface CustomerInteractionDto {
  id?: string;
  tenantId: string;
  customerId?: string;
  agentId: string;
  interactionChannel: string;
  interactionType: string;
  summary: string;
  detailedNotes?: string;
  externalReferenceId?: string | null;
  interactionDate?: string;
  updatedAt?: string;
}
