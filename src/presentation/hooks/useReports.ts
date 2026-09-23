"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type {
  GetBusinessDateReportParams,
  GetDailyReportParams,
  GetDateRangeReportParams,
  GetItemSalesParams,
  GetLoyaltyPointsParams,
} from "@/core/domain/repositories/IReportRepository";
import type { IReportService } from "@/core/domain/services/IReportService";

const REPORTS_QUERY_KEY = ["reports"];

export function useDailySales(params: GetDailyReportParams | null) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, "daily-sales", params?.locationId, params?.date],
    queryFn: () => {
      const service = container.resolve<IReportService>("reportService");
      return service.getDailySales(params!);
    },
    enabled: !!params?.date,
    placeholderData: keepPreviousData,
  });
}

export function useSalesByCategory(params: GetDateRangeReportParams | null) {
  return useQuery({
    queryKey: [
      ...REPORTS_QUERY_KEY,
      "sales-by-category",
      params?.locationId,
      params?.fromDate,
      params?.toDate,
      params?.limit,
    ],
    queryFn: () => {
      const service = container.resolve<IReportService>("reportService");
      return service.getSalesByCategory(params!);
    },
    enabled: !!params?.fromDate && !!params?.toDate,
    placeholderData: keepPreviousData,
  });
}

export function useSalesByItem(params: GetDateRangeReportParams | null) {
  return useQuery({
    queryKey: [
      ...REPORTS_QUERY_KEY,
      "sales-by-item",
      params?.locationId,
      params?.fromDate,
      params?.toDate,
      params?.limit,
    ],
    queryFn: () => {
      const service = container.resolve<IReportService>("reportService");
      return service.getSalesByItem(params!);
    },
    enabled: !!params?.fromDate && !!params?.toDate,
    placeholderData: keepPreviousData,
  });
}

export function useSalesByHour(params: GetDailyReportParams | null) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, "sales-by-hour", params?.locationId, params?.date],
    queryFn: () => {
      const service = container.resolve<IReportService>("reportService");
      return service.getSalesByHour(params!);
    },
    enabled: !!params?.date,
    placeholderData: keepPreviousData,
  });
}

export function useServerPerformance(params: GetDateRangeReportParams | null) {
  return useQuery({
    queryKey: [
      ...REPORTS_QUERY_KEY,
      "server-performance",
      params?.locationId,
      params?.fromDate,
      params?.toDate,
      params?.limit,
    ],
    queryFn: () => {
      const service = container.resolve<IReportService>("reportService");
      return service.getServerPerformance(params!);
    },
    enabled: !!params?.fromDate && !!params?.toDate,
    placeholderData: keepPreviousData,
  });
}

export function useZReport(params: GetDailyReportParams | null) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, "z-report", params?.locationId, params?.date],
    queryFn: () => {
      const service = container.resolve<IReportService>("reportService");
      return service.getZReport(params!);
    },
    enabled: !!params?.date,
    placeholderData: keepPreviousData,
  });
}

export function useSalesSummary(params: GetBusinessDateReportParams | null) {
  return useQuery({
    queryKey: [
      ...REPORTS_QUERY_KEY,
      "sales-summary",
      params?.from,
      params?.to,
      params?.locationId,
    ],
    queryFn: () => {
      const service = container.resolve<IReportService>("reportService");
      return service.getSalesSummary(params!);
    },
    enabled: !!params?.from,
    placeholderData: keepPreviousData,
  });
}

export function useItemSales(params: GetItemSalesParams | null) {
  return useQuery({
    queryKey: [
      ...REPORTS_QUERY_KEY,
      "item-sales",
      params?.from,
      params?.to,
      params?.locationId,
      params?.page,
      params?.limit,
      params?.search,
      params?.categoryId,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IReportService>("reportService");
      return service.getItemSales(params!);
    },
    enabled: !!params?.from,
    placeholderData: keepPreviousData,
  });
}

export function useOtherIncomeExpenses(params: GetBusinessDateReportParams | null) {
  return useQuery({
    queryKey: [
      ...REPORTS_QUERY_KEY,
      "other-income-expenses",
      params?.from,
      params?.to,
      params?.locationId,
    ],
    queryFn: () => {
      const service = container.resolve<IReportService>("reportService");
      return service.getOtherIncomeExpenses(params!);
    },
    enabled: !!params?.from,
    placeholderData: keepPreviousData,
  });
}

export function useMemberCardsReport(params: GetBusinessDateReportParams | null) {
  return useQuery({
    queryKey: [
      ...REPORTS_QUERY_KEY,
      "member-cards",
      params?.from,
      params?.to,
      params?.locationId,
    ],
    queryFn: () => {
      const service = container.resolve<IReportService>("reportService");
      return service.getMemberCards(params!);
    },
    enabled: !!params?.from,
    placeholderData: keepPreviousData,
  });
}

export function useLoyaltyPointsReport(params: GetLoyaltyPointsParams | null) {
  return useQuery({
    queryKey: [
      ...REPORTS_QUERY_KEY,
      "loyalty-points",
      params?.from,
      params?.to,
      params?.locationId,
      params?.top,
    ],
    queryFn: () => {
      const service = container.resolve<IReportService>("reportService");
      return service.getLoyaltyPoints(params!);
    },
    enabled: !!params?.from,
    placeholderData: keepPreviousData,
  });
}
