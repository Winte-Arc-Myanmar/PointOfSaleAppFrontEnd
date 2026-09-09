/**
 * Membership member (customer membership account with optional physical/virtual card).
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export type MembershipMemberStatus = "ACTIVE" | "CLOSED" | "SUSPENDED" | string;
export type MembershipCardBindStatus = "BOUND" | "UNBOUND" | string;

export interface MembershipMember {
  id: Id;
  tenantId: string;
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  cardTemplateId: string;
  cardTemplateName: string;
  tier: string;
  cardNumber: string | null;
  cardBindStatus: MembershipCardBindStatus;
  walletBalance: number;
  status: MembershipMemberStatus;
  registeredAt: string;
  closedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface MembershipTopupRequest {
  amount: number;
  note?: string;
}

export interface MembershipRefundRequest {
  amount: number;
  reason?: string;
}

export interface MembershipBindCardRequest {
  cardNumber: string;
}

export interface MembershipRegisterRequest {
  tenantId: string;
  customerId: string;
  cardTemplateId: string;
  cardNumber?: string | null;
  initialTopup?: number;
}
