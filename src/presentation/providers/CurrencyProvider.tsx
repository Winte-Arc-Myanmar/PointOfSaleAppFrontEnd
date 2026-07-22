"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { TenantCurrency } from "@/core/domain/entities/Tenant";

export type DisplayCurrency = TenantCurrency;

interface CurrencyContextValue {
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

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const value = useMemo<CurrencyContextValue>(
    () => ({
      formatPrice: (value, currency = "MMK") => {
      const amount = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value) || 0);

      return currency === "MMK" ? `${amount} MMK` : `$${amount}`;
      },
    }),
    [],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
