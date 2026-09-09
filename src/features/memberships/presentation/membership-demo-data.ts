/**
 * Demo fallback data for Membership/Customer menu when APIs are empty/unavailable.
 */

import type { MembershipMember } from "@/core/domain/entities/MembershipMember";
import type { PaginatedResult } from "@/core/domain/types/pagination";

const NOW = "2026-09-01T00:00:00.000Z";
const DEMO_TENANT = "demo-tenant";

export const DEMO_MEMBERSHIP_MEMBERS: MembershipMember[] = [
  {
    id: "mm-001",
    tenantId: DEMO_TENANT,
    customerId: "cust-aye",
    customerName: "Aye Chan",
    phone: "09-111-222-333",
    email: "aye.chan@example.com",
    cardTemplateId: "mct-gold-annual",
    cardTemplateName: "Gold Annual Card",
    tier: "GOLD",
    cardNumber: "MC-1001-8844",
    cardBindStatus: "BOUND",
    walletBalance: 85000,
    status: "ACTIVE",
    registeredAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "mm-002",
    tenantId: DEMO_TENANT,
    customerId: "cust-min",
    customerName: "Min Thu",
    phone: "09-444-555-666",
    email: "min.thu@example.com",
    cardTemplateId: "mct-silver-monthly",
    cardTemplateName: "Silver Student Card",
    tier: "SILVER",
    cardNumber: null,
    cardBindStatus: "UNBOUND",
    walletBalance: 12000,
    status: "ACTIVE",
    registeredAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "mm-003",
    tenantId: DEMO_TENANT,
    customerId: "cust-su",
    customerName: "Su Myat",
    phone: "09-777-888-999",
    email: "su.myat@example.com",
    cardTemplateId: "mct-bronze-monthly",
    cardTemplateName: "Bronze Monthly Card",
    tier: "BRONZE",
    cardNumber: "MC-1001-2200",
    cardBindStatus: "BOUND",
    walletBalance: 3500,
    status: "ACTIVE",
    registeredAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "mm-004",
    tenantId: DEMO_TENANT,
    customerId: "cust-htun",
    customerName: "Htun Lin",
    phone: "09-222-333-444",
    email: "htun.lin@example.com",
    cardTemplateId: "mct-platinum-lifetime",
    cardTemplateName: "Platinum Lifetime Card",
    tier: "PLATINUM",
    cardNumber: "MC-9000-0001",
    cardBindStatus: "BOUND",
    walletBalance: 0,
    status: "CLOSED",
    registeredAt: "2025-01-10T00:00:00.000Z",
    closedAt: "2026-08-01T00:00:00.000Z",
    createdAt: "2025-01-10T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
];

/** Mutable in-memory store so demo mutations persist during the session. */
let demoStore: MembershipMember[] = DEMO_MEMBERSHIP_MEMBERS.map((m) => ({ ...m }));

export function resetDemoMembershipMembers() {
  demoStore = DEMO_MEMBERSHIP_MEMBERS.map((m) => ({ ...m }));
}

export function getDemoMembershipMembersPage(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): PaginatedResult<MembershipMember> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const search = params?.search?.trim().toLowerCase() ?? "";
  const filtered = demoStore.filter((item) => {
    if (!search) return true;
    const hay = `${item.customerName} ${item.phone} ${item.email} ${item.cardNumber ?? ""} ${item.tier}`.toLowerCase();
    return hay.includes(search);
  });
  const start = (page - 1) * limit;
  return {
    items: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
  };
}

export function getDemoMembershipMemberById(id: string): MembershipMember | null {
  return demoStore.find((m) => m.id === id) ?? null;
}

export function upsertDemoMembershipMember(member: MembershipMember) {
  const idx = demoStore.findIndex((m) => m.id === member.id);
  if (idx >= 0) demoStore[idx] = member;
  else demoStore = [member, ...demoStore];
  return member;
}

export function createDemoMembershipMember(
  input: {
    tenantId: string;
    customerId: string;
    customerName?: string;
    phone?: string;
    email?: string;
    cardTemplateId: string;
    cardTemplateName?: string;
    tier?: string;
    cardNumber?: string | null;
    initialTopup?: number;
  },
): MembershipMember {
  const now = new Date().toISOString();
  const member: MembershipMember = {
    id: `mm-${Date.now()}`,
    tenantId: input.tenantId,
    customerId: input.customerId,
    customerName: input.customerName ?? "New Member",
    phone: input.phone ?? "",
    email: input.email ?? "",
    cardTemplateId: input.cardTemplateId,
    cardTemplateName: input.cardTemplateName ?? "Membership Card",
    tier: input.tier ?? "BRONZE",
    cardNumber: input.cardNumber ?? null,
    cardBindStatus: input.cardNumber ? "BOUND" : "UNBOUND",
    walletBalance: Number(input.initialTopup) || 0,
    status: "ACTIVE",
    registeredAt: now,
    createdAt: now,
    updatedAt: now,
  };
  return upsertDemoMembershipMember(member);
}

export function isDemoMembershipId(id: string) {
  return id.startsWith("mm-");
}
