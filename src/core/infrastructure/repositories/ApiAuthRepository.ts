/**
 * Auth repository - login/register via external API using HttpClient.
 * Infrastructure layer.
 * When backend is not ready, set AUTH_USE_MOCK (server) / NEXT_PUBLIC_AUTH_USE_MOCK (client).
 */

import type { IAuthRepository } from "@/core/domain/repositories/IAuthRepository";
import type {
  LoginCredentials,
  RegisterData,
  AuthUser,
} from "@/core/domain/services/IAuthService";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

const useMock =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_AUTH_USE_MOCK === "true"
    : process.env.AUTH_USE_MOCK === "true";

export class ApiAuthRepository implements IAuthRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async login(credentials: LoginCredentials): Promise<AuthUser | null> {
    if (useMock) {
      return {
        id: "mock",
        email: credentials.email,
        name: credentials.email.split("@")[0],
        accessToken: "mock-token",
      };
    }
    try {
      const data = await this.httpClient.post<{
        user?: AuthUser;
        token?: string;
        accessToken?: string;
      }>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return {
        id: data.user?.id,
        email: data.user?.email ?? credentials.email,
        name: data.user?.name,
        image: data.user?.image,
        accessToken: data.token ?? data.accessToken ?? data.user?.accessToken,
      };
    } catch {
      return null;
    }
  }

  async register(data: RegisterData): Promise<void> {
    if (useMock) return;
    await this.httpClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
  }
}
