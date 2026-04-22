/**
 * Axios HTTP client for external backend.
 * All API responses are expected wrapped as { success, message, data?, meta? }.
 * Unwrapping is done here so repositories receive data directly.
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { getSession, signOut } from "next-auth/react";
import { API_CONFIG } from "./constants";

/** Backend returns { success, message, data?, meta? }. Return data when present. */
function unwrap<T>(body: unknown): T {
  if (
    body != null &&
    typeof body === "object" &&
    "data" in body &&
    (body as Record<string, unknown>).data !== undefined
  ) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export class HttpClient {
  private client: AxiosInstance;

  constructor(baseUrl?: string) {
    this.client = axios.create({
      baseURL: baseUrl ?? API_CONFIG.BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

    this.client.interceptors.request.use(
      async (config) => {
        if (typeof window !== "undefined") {
          const session = await getSession();
          if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
          signOut({ callbackUrl: "/login" });
        }
        return Promise.reject(error);
      },
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<unknown> = await this.client.get(url, config);
    return unwrap<T>(res.data);
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const res: AxiosResponse<unknown> = await this.client.post(
      url,
      data,
      config,
    );
    return unwrap<T>(res.data);
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const res: AxiosResponse<unknown> = await this.client.put(
      url,
      data,
      config,
    );
    return unwrap<T>(res.data);
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const res: AxiosResponse<unknown> = await this.client.patch(
      url,
      data,
      config,
    );
    return unwrap<T>(res.data);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<unknown> = await this.client.delete(url, config);
    return unwrap<T>(res.data);
  }
}
