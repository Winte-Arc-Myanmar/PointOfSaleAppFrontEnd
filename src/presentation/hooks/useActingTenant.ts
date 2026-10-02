"use client";

import { useSyncExternalStore } from "react";
import {
  getActingTenantId,
  subscribeActingTenant,
} from "@/lib/acting-tenant";

export function useActingTenant(): string | null {
  return useSyncExternalStore(subscribeActingTenant, getActingTenantId, () => null);
}
