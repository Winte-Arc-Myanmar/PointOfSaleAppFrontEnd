/**
 * Membership member DTOs.
 * Application layer - matches backend contract.
 */

export interface MembershipMemberDto {
  id?: string;
  tenantId: string;
  customerId: string;
  customerName?: string;
  phone?: string;
  email?: string;
  cardTemplateId: string;
  cardTemplateName?: string;
  tier?: string;
  cardNumber?: string | null;
  cardBindStatus?: string;
  walletBalance?: number | string;
  status?: string;
  registeredAt?: string;
  closedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  customer?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
  cardTemplate?: {
    id?: string;
    name?: string;
    tier?: string;
  };
}

export interface MembershipRegisterDto {
  tenantId: string;
  customerId: string;
  cardTemplateId: string;
  cardNumber?: string | null;
  initialTopup?: number;
}

export interface MembershipTopupDto {
  amount: number;
  note?: string;
}

export interface MembershipRefundDto {
  amount: number;
  reason?: string;
}

export interface MembershipBindCardDto {
  cardNumber: string;
}
