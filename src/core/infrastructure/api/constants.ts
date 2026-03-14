/**
 * API configuration - points to external backend.
 * Replace with env vars in production.
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
} as const;

export const API_ENDPOINTS = {
  PRODUCTS: {
    LIST: "/products",
    CREATE: "/products",
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
} as const;
