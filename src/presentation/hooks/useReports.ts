"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type {
  GetDailyReportParams,
  GetDateRangeReportParams,
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
    enabled: !!params?.locationId && !!params?.date,
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
    enabled: !!params?.locationId && !!params?.fromDate && !!params?.toDate,
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
    enabled: !!params?.locationId && !!params?.fromDate && !!params?.toDate,
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
    enabled: !!params?.locationId && !!params?.date,
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
    enabled: !!params?.locationId && !!params?.fromDate && !!params?.toDate,
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
    enabled: !!params?.locationId && !!params?.date,
    placeholderData: keepPreviousData,
  });
}
