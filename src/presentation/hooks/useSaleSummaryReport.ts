"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";

export interface SaleSummaryRow {
  key: string;
  label: string;
  count: number;
  amount: string;
}

export interface SaleSummaryCategoryRow {
  key: string;
  label: string;
  quantity: string;
  amount: string;
}

export interface SaleSummaryGroup {
  rows: SaleSummaryRow[];
  count: number;
  amount: string;
}

export interface SaleSummaryReport {
  shopName: string | null;
  from: string;
  to: string;
  locationIds: string[] | null;
  sales: {
    subtotal: SaleSummaryRow;
    serviceCharge: SaleSummaryRow;
    tax: SaleSummaryRow;
    discount: SaleSummaryRow;
    promotion: SaleSummaryRow;
    tips: SaleSummaryRow;
    refund: SaleSummaryRow;
    total: string;
    receivable: string;
    totalSales: string;
    totalOrders: number;
    returnQuantity: string;
  };
  payments: SaleSummaryGroup & { receipts: SaleSummaryGroup; excluded: SaleSummaryGroup };
  cashDrawer: { pettyCash: string; orderRevenue: string; cashRefunds: string; estimated: string };
  categories: { rows: SaleSummaryCategoryRow[]; quantity: string; amount: string };
  orderTypes: { rows: SaleSummaryRow[]; count: number; amount: string };
}

export interface SaleSummaryParams {
  from: string;
  to: string;
  locationId?: string;
}

const ENDPOINT = "/v1/reports/sale-summary";

export const useSaleSummaryReport = (params: SaleSummaryParams) =>
  useQuery({
    queryKey: ["reports", "sale-summary", params.from, params.to, params.locationId],
    queryFn: () =>
      container.resolve<HttpClient>("httpClient").get<SaleSummaryReport>(ENDPOINT, {
        params: {
          from: params.from,
          to: params.to,
          ...(params.locationId ? { locationId: params.locationId } : {}),
        },
      }),
    placeholderData: keepPreviousData,
  });
