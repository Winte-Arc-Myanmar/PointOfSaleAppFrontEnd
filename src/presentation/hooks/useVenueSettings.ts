"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IVenueSettingRepository } from "@/core/domain/repositories/IVenueSettingRepository";
import type { VenueSettingUpdate } from "@/core/domain/entities/VenueSetting";

const QUERY_KEY = ["venue-settings"];
const repository = () => container.resolve<IVenueSettingRepository>("venueSettingRepository");

export function useVenueSettings() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: () => repository().get() });
}

export function useUpdateVenueSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VenueSettingUpdate) => repository().update(data),
    onSuccess: (saved) => queryClient.setQueryData(QUERY_KEY, saved),
  });
}
