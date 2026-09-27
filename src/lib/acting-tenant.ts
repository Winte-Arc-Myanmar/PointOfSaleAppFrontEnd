/**
 * The tenant a system admin is working in. Sent as X-Tenant-Id on every request,
 * so the API answers as that tenant would see it.
 */

/** Offer "All tenants" in the switcher. Off for now: an admin always picks one. */
export const ALLOW_ALL_TENANTS = false;

export const ACTING_TENANT_HEADER = "X-Tenant-Id";

const STORAGE_KEY = "acting-tenant-id";
const listeners = new Set<() => void>();

/** Platform-wide endpoints that must never be narrowed to one tenant. */
const GLOBAL_ENDPOINTS = ["/v1/system-admin", "/v1/tenants", "/v1/auth"];

export function isGlobalEndpoint(url: string | undefined): boolean {
  return Boolean(url && GLOBAL_ENDPOINTS.some((prefix) => url.startsWith(prefix)));
}

export function getActingTenantId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setActingTenantId(tenantId: string | null): void {
  try {
    if (tenantId) window.localStorage.setItem(STORAGE_KEY, tenantId);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked; the choice then lasts until reload.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeActingTenant(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
