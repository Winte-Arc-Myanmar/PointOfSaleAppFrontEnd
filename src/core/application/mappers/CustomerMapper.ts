/**
 * Customer entity <-> DTO mappers.
 * Application layer.
 */

import type { Customer } from "@/core/domain/entities/Customer";
import type { CustomerDto } from "../dtos/CustomerDto";

export function toCustomer(dto: CustomerDto & { id: string }): Customer {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    accountType: dto.accountType ?? "RETAIL",
    name: dto.name ?? "",
    phone: dto.phone ?? "",
    email: dto.email ?? "",
    hasCreditAccount: Boolean(dto.hasCreditAccount),
    maxCreditLimit: dto.maxCreditLimit ?? "0.0000",
    currentCreditBalance: dto.currentCreditBalance ?? "0.0000",
    paymentTermsDays: Number(dto.paymentTermsDays ?? 0),
    loyaltyTier: dto.loyaltyTier ?? "BRONZE",
    lifetimePointsEarned: Number(dto.lifetimePointsEarned ?? 0),
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toCustomerDto(customer: Partial<Customer>): CustomerDto {
  return {
    ...(customer.id && { id: String(customer.id) }),
    tenantId: customer.tenantId ?? "",
    accountType: customer.accountType ?? "RETAIL",
    name: customer.name ?? "",
    phone: customer.phone ?? "",
    email: customer.email ?? "",
    hasCreditAccount: Boolean(customer.hasCreditAccount),
    maxCreditLimit: customer.maxCreditLimit ?? "0.0000",
    paymentTermsDays: Number(customer.paymentTermsDays ?? 0),
    loyaltyTier: customer.loyaltyTier ?? "BRONZE",
    ...(customer.currentCreditBalance && {
      currentCreditBalance: customer.currentCreditBalance,
    }),
    ...(customer.lifetimePointsEarned != null && {
      lifetimePointsEarned: customer.lifetimePointsEarned,
    }),
    ...(customer.createdAt && { createdAt: customer.createdAt }),
    ...(customer.updatedAt && { updatedAt: customer.updatedAt }),
  };
}

/** POST/PATCH body — server sets credit balance and lifetime points. */
export function toCustomerWritePayload(data: {
  tenantId: string;
  accountType: string;
  name: string;
  phone?: string;
  email?: string;
  hasCreditAccount: boolean;
  maxCreditLimit: string;
  paymentTermsDays: number;
  loyaltyTier: string;
}): Record<string, unknown> {
  const email = data.email?.trim() ?? "";
  return {
    tenantId: data.tenantId,
    accountType: data.accountType,
    name: data.name,
    phone: data.phone?.trim() ?? "",
    ...(email ? { email } : {}),
    hasCreditAccount: data.hasCreditAccount,
    maxCreditLimit: data.maxCreditLimit,
    paymentTermsDays: data.paymentTermsDays,
    loyaltyTier: data.loyaltyTier,
  };
}

