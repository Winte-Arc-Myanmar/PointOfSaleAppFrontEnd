/**
 * Customer interaction (nested under /v1/customers/:customerId/interactions).
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export type InteractionChannel =
  | "EMAIL"
  | "PHONE"
  | "CHAT"
  | "IN_PERSON"
  | "SMS"
  | string;

export type InteractionType =
  | "INQUIRY"
  | "COMPLAINT"
  | "FOLLOW_UP"
  | "SUPPORT"
  | "SALE"
  | "OTHER"
  | string;

export interface CustomerInteraction {
  id: Id;
  tenantId: string;
  customerId: string;
  agentId: string;
  interactionChannel: InteractionChannel;
  interactionType: InteractionType;
  summary: string;
  detailedNotes: string;
  externalReferenceId: string | null;
  interactionDate?: string | null;
  updatedAt?: string | null;
}
