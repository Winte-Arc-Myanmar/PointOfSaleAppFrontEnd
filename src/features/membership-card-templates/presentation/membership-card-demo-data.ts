/**
 * Demo fallback data for Membership Card Templates UI
 * when backend endpoints are missing or return empty results.
 */

import type { MembershipCardCategory } from "@/core/domain/entities/MembershipCardCategory";
import type { MembershipCardTemplate } from "@/core/domain/entities/MembershipCardTemplate";
import type { PaginatedResult } from "@/core/domain/types/pagination";

const DEMO_TENANT_ID = "demo-tenant";
const NOW = "2026-09-01T00:00:00.000Z";

export const DEMO_MEMBERSHIP_CARD_CATEGORIES: MembershipCardCategory[] = [
  {
    id: "mcc-annual",
    name: "Annual Cards",
    tenantId: DEMO_TENANT_ID,
    parentId: null,
    description: "Yearly membership payment plans",
    sortOrder: 1,
    createdAt: NOW,
    updatedAt: NOW,
    children: [
      {
        id: "mcc-annual-premium",
        name: "Premium Annual",
        tenantId: DEMO_TENANT_ID,
        parentId: "mcc-annual",
        description: "Higher-tier annual packages",
        sortOrder: 1,
        createdAt: NOW,
        updatedAt: NOW,
        children: [],
      },
      {
        id: "mcc-annual-standard",
        name: "Standard Annual",
        tenantId: DEMO_TENANT_ID,
        parentId: "mcc-annual",
        description: "Entry annual packages",
        sortOrder: 2,
        createdAt: NOW,
        updatedAt: NOW,
        children: [],
      },
    ],
  },
  {
    id: "mcc-monthly",
    name: "Monthly Cards",
    tenantId: DEMO_TENANT_ID,
    parentId: null,
    description: "Recurring monthly membership cards",
    sortOrder: 2,
    createdAt: NOW,
    updatedAt: NOW,
    children: [
      {
        id: "mcc-monthly-student",
        name: "Student Monthly",
        tenantId: DEMO_TENANT_ID,
        parentId: "mcc-monthly",
        description: "Discounted student plans",
        sortOrder: 1,
        createdAt: NOW,
        updatedAt: NOW,
        children: [],
      },
    ],
  },
  {
    id: "mcc-lifetime",
    name: "Lifetime Cards",
    tenantId: DEMO_TENANT_ID,
    parentId: null,
    description: "One-time lifetime memberships",
    sortOrder: 3,
    createdAt: NOW,
    updatedAt: NOW,
    children: [],
  },
];

export const DEMO_MEMBERSHIP_CARD_TEMPLATES: MembershipCardTemplate[] = [
  {
    id: "mct-bronze-monthly",
    tenantId: DEMO_TENANT_ID,
    categoryId: "mcc-monthly",
    categoryName: "Monthly Cards",
    name: "Bronze Monthly Card",
    tier: "BRONZE",
    amount: 15000,
    billingPeriod: "MONTHLY",
    durationMonths: 1,
    rules: "Earn 1 point per 1,000 MMK spent. No guest privileges.",
    benefits: "5% birthday discount; free drink on signup month.",
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "mct-silver-monthly",
    tenantId: DEMO_TENANT_ID,
    categoryId: "mcc-monthly-student",
    categoryName: "Student Monthly",
    name: "Silver Student Card",
    tier: "SILVER",
    amount: 25000,
    billingPeriod: "MONTHLY",
    durationMonths: 1,
    rules: "Valid student ID required. Max 2 redemptions/day.",
    benefits: "8% off menu items; free dessert twice a month.",
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "mct-gold-annual",
    tenantId: DEMO_TENANT_ID,
    categoryId: "mcc-annual-premium",
    categoryName: "Premium Annual",
    name: "Gold Annual Card",
    tier: "GOLD",
    amount: 280000,
    billingPeriod: "YEARLY",
    durationMonths: 12,
    rules: "Non-transferable. Auto-renews unless cancelled 14 days prior.",
    benefits: "12% off; priority seating; 2 guest passes/month.",
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "mct-platinum-lifetime",
    tenantId: DEMO_TENANT_ID,
    categoryId: "mcc-lifetime",
    categoryName: "Lifetime Cards",
    name: "Platinum Lifetime Card",
    tier: "PLATINUM",
    amount: 1500000,
    billingPeriod: "LIFETIME",
    durationMonths: null,
    rules: "One card per customer. ID verification required at issue.",
    benefits: "15% off forever; VIP lounge; exclusive events.",
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "mct-bronze-annual",
    tenantId: DEMO_TENANT_ID,
    categoryId: "mcc-annual-standard",
    categoryName: "Standard Annual",
    name: "Bronze Annual Card",
    tier: "BRONZE",
    amount: 150000,
    billingPeriod: "YEARLY",
    durationMonths: 12,
    rules: "Unused months do not roll over.",
    benefits: "6% off; free birthday dessert.",
    isActive: false,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export function flattenMembershipCardCategories(
  categories: MembershipCardCategory[],
): MembershipCardCategory[] {
  const result: MembershipCardCategory[] = [];
  const walk = (nodes: MembershipCardCategory[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children?.length) walk(node.children);
    }
  };
  walk(categories);
  return result;
}

export function getDemoMembershipCardCategoriesPage(
  params?: { page?: number; limit?: number },
): PaginatedResult<MembershipCardCategory> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const flat = flattenMembershipCardCategories(DEMO_MEMBERSHIP_CARD_CATEGORIES);
  const start = (page - 1) * limit;
  const items = flat.slice(start, start + limit);
  return {
    items,
    total: flat.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(flat.length / limit)),
  };
}

export function getDemoMembershipCardTemplatesPage(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): PaginatedResult<MembershipCardTemplate> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const search = params?.search?.trim().toLowerCase() ?? "";

  const filtered = DEMO_MEMBERSHIP_CARD_TEMPLATES.filter((item) => {
    if (!search) return true;
    const hay = `${item.name} ${item.tier} ${item.rules} ${item.benefits} ${item.categoryName ?? ""}`.toLowerCase();
    return hay.includes(search);
  });

  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);
  return {
    items,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
  };
}
