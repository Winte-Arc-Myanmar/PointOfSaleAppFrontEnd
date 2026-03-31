/**
 * API configuration - points to external backend.
 * Replace with env vars in production.
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
} as const;

export const API_ENDPOINTS = {
  VENDORS: {
    LIST: "/v1/vendors",
    BY_ID: (id: string) => `/v1/vendors/${id}`,
    CREATE: "/v1/vendors",
    UPDATE: (id: string) => `/v1/vendors/${id}`,
    DELETE: (id: string) => `/v1/vendors/${id}`,
  },
  CUSTOMERS: {
    LIST: "/v1/customers",
    BY_ID: (id: string) => `/v1/customers/${id}`,
    CREATE: "/v1/customers",
    UPDATE: (id: string) => `/v1/customers/${id}`,
    DELETE: (id: string) => `/v1/customers/${id}`,
  },
  PRODUCTS: {
    LIST: "/v1/products",
    BY_ID: (id: string) => `/v1/products/${id}`,
    CREATE: "/v1/products",
    UPDATE: (id: string) => `/v1/products/${id}`,
    DELETE: (id: string) => `/v1/products/${id}`,
    VARIANTS: (productId: string) => ({
      LIST: `/v1/products/${productId}/variants`,
      BY_ID: (variantId: string) =>
        `/v1/products/${productId}/variants/${variantId}`,
      CREATE: `/v1/products/${productId}/variants`,
      UPDATE: (variantId: string) =>
        `/v1/products/${productId}/variants/${variantId}`,
      DELETE: (variantId: string) =>
        `/v1/products/${productId}/variants/${variantId}`,
    }),
  },
  TENANTS: {
    LIST: "/v1/tenants",
    BY_ID: (id: string) => `/v1/tenants/${id}`,
    CREATE: "/v1/tenants",
    UPDATE: (id: string) => `/v1/tenants/${id}`,
    DELETE: (id: string) => `/v1/tenants/${id}`,
  },
  AUTH: {
    /** POST - sign in;  */
    SIGNIN: "/v1/auth/signin",
    /** GET - current session (Bearer token) */
    SESSION: "/v1/auth/session",
    REGISTER: "/v1/auth/register",
  },
  USERS: {
    LIST: "/v1/users",
    BY_ID: (id: string) => `/v1/users/${id}`,
    CREATE: "/v1/users",
    UPDATE: (id: string) => `/v1/users/${id}`,
    DELETE: (id: string) => `/v1/users/${id}`,
  },
  UOM_CLASSES: {
    LIST: "/v1/uom-classes",
    BY_ID: (id: string) => `/v1/uom-classes/${id}`,
    CREATE: "/v1/uom-classes",
    UPDATE: (id: string) => `/v1/uom-classes/${id}`,
    DELETE: (id: string) => `/v1/uom-classes/${id}`,
  },
  UOMS: {
    LIST: "/v1/uoms",
    BY_ID: (id: string) => `/v1/uoms/${id}`,
    CREATE: "/v1/uoms",
    UPDATE: (id: string) => `/v1/uoms/${id}`,
    DELETE: (id: string) => `/v1/uoms/${id}`,
  },
  CATEGORIES: {
    LIST: "/v1/categories",
    TREE: "/v1/categories/tree",
    BY_ID: (id: string) => `/v1/categories/${id}`,
    CREATE: "/v1/categories",
    UPDATE: (id: string) => `/v1/categories/${id}`,
    DELETE: (id: string) => `/v1/categories/${id}`,
  },
  BRANCHES: {
    LIST: "/v1/branches",
    BY_ID: (id: string) => `/v1/branches/${id}`,
    CREATE: "/v1/branches",
    UPDATE: (id: string) => `/v1/branches/${id}`,
    DELETE: (id: string) => `/v1/branches/${id}`,
  },
  LOCATIONS: {
    LIST: "/v1/locations",
    TREE: "/v1/locations/tree",
    BY_ID: (id: string) => `/v1/locations/${id}`,
    CREATE: "/v1/locations",
    UPDATE: (id: string) => `/v1/locations/${id}`,
    DELETE: (id: string) => `/v1/locations/${id}`,
  },
  INVENTORY_LEDGER: {
    LIST: "/v1/inventory-ledger",
    EXPIRING: "/v1/inventory-ledger/expiring",
    WRITE_OFF: "/v1/inventory-ledger/write-off",
    BALANCE: (variantId: string, locationId: string) =>
      `/v1/inventory-ledger/balance/${variantId}/${locationId}`,
    BY_ID: (id: string) => `/v1/inventory-ledger/${id}`,
    CREATE: "/v1/inventory-ledger",
    DELETE: (id: string) => `/v1/inventory-ledger/${id}`,
  },
  ROLES: {
    LIST: "/v1/roles",
    BY_ID: (id: string) => `/v1/roles/${id}`,
    CREATE: "/v1/roles",
    DELETE: (id: string) => `/v1/roles/${id}`,
    ASSIGN_PERMISSIONS: (id: string) => `/v1/roles/${id}/permissions`,
  },
  PERMISSIONS: {
    LIST: "/v1/permissions",
  },
  SYSTEM_ADMIN: {
    ONBOARD_TENANT: "/v1/system-admin/tenants/onboard",
    DELETE_TENANT: (id: string) => `/v1/system-admin/tenants/${id}`,
    CREATE_USER: "/v1/system-admin/users",
    ASSIGN_PERMISSIONS: "/v1/system-admin/roles/assign-permissions",
    ASSIGN_ROLE: "/v1/system-admin/users/assign-role",
  },
} as const;
