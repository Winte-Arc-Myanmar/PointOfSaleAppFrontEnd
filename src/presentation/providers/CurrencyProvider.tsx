"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IVenueSettingRepository } from "@/core/domain/repositories/IVenueSettingRepository";
import type { TenantCurrency } from "@/core/domain/entities/Tenant";
import { formatMoney, setShopCurrency } from "@/lib/money";

export type DisplayCurrency = TenantCurrency;

interface CurrencyContextValue {
  currency: DisplayCurrency;
  formatPrice: (value: number, currency?: DisplayCurrency) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }

  return context;
}

/** Money on screen is in the currency chosen in Shop settings. */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const { data: settings } = useQuery({
    queryKey: ["venue-settings"],
    queryFn: () =>
      container.resolve<IVenueSettingRepository>("venueSettingRepository").get(),
    enabled: status === "authenticated",
    retry: false,
  });
  const currency = settings?.currency ?? "MMK";
  setShopCurrency(currency);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      formatPrice: (amount, override = currency) => formatMoney(amount, override),
    }),
    [currency],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
