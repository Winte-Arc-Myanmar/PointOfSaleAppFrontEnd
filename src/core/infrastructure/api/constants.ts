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
} as const;
