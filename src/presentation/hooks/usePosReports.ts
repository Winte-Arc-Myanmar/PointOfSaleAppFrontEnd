"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type {
  ApiPosReportRepository,
  PosBillsParams,
  PosRangeParams,
} from "@/core/infrastructure/repositories/ApiPosReportRepository";

const KEY = ["reports", "pos"];
const repository = () => container.resolve<ApiPosReportRepository>("posReportRepository");
const rangeKey = (p: PosRangeParams) => [p.from, p.to, p.locationId];

export const usePosBills = (params: PosBillsParams) =>
  useQuery({
    queryKey: [...KEY, "bills", params.posType, ...rangeKey(params), params.page, params.limit, params.search],
    queryFn: () => repository().bills(params),
    placeholderData: keepPreviousData,
  });

export const useBarCategories = (params: PosRangeParams) =>
  useQuery({
    queryKey: [...KEY, "bar-categories", ...rangeKey(params)],
    queryFn: () => repository().barCategories(params),
    placeholderData: keepPreviousData,
  });

export const useSpaMenuReport = (params: PosRangeParams) =>
  useQuery({
    queryKey: [...KEY, "spa-menu", ...rangeKey(params)],
    queryFn: () => repository().spaMenu(params),
    placeholderData: keepPreviousData,
  });

export const useKtvSessionReport = (params: PosRangeParams) =>
  useQuery({
    queryKey: [...KEY, "ktv-sessions", ...rangeKey(params)],
    queryFn: () => repository().ktvSessions(params),
    placeholderData: keepPreviousData,
  });

export const useHostessReport = (params: PosRangeParams) =>
  useQuery({
    queryKey: [...KEY, "hostesses", ...rangeKey(params)],
    queryFn: () => repository().hostesses(params),
    placeholderData: keepPreviousData,
  });
