"use client";

import { useMemo } from "react";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useUomClasses } from "@/presentation/hooks/useUomClasses";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useAccountingPeriods } from "@/presentation/hooks/useAccountingPeriods";

type Named = { id: unknown };

function byId<T extends Named>(items: T[], nameOf: (item: T) => string | undefined) {
  return Object.fromEntries(
    items.map((item) => [String(item.id), nameOf(item) ?? ""]).filter(([, name]) => name),
  ) as Record<string, string>;
}

/** Names to show in place of IDs, keyed by ID. A missing ID shows as "—". */
export function useLocationNames() {
  const { data } = useLocations({ page: 1, limit: 100 });
  return useMemo(() => byId(getPaginatedItems(data), (l) => l.name), [data]);
}

export function useUomClassNames() {
  const { data } = useUomClasses({ page: 1, limit: 100 });
  return useMemo(() => byId(getPaginatedItems(data), (c) => c.name), [data]);
}

export function useProductNames() {
  const { data } = useProducts({ page: 1, limit: 100 });
  return useMemo(() => byId(getPaginatedItems(data), (p) => p.name), [data]);
}

export function useAccountingPeriodNames() {
  const { data } = useAccountingPeriods({ page: 1, limit: 100 });
  return useMemo(() => byId(getPaginatedItems(data), (p) => p.periodName), [data]);
}
