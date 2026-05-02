/**
 * Auth repository - login/register via external API using HttpClient.
 * Infrastructure layer.
 */

import type { IAuthRepository } from "@/core/domain/repositories/IAuthRepository";
import type { AuthUser } from "@/core/domain/entities/User";
import type { LoginCredentials, RegisterData } from "@/core/domain/types/auth";
import type { SigninResponseDto } from "@/core/application/dtos/AuthDto";
import { toSigninRequestDto, toAuthUser } from "@/core/application/mappers/AuthMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiAuthRepository implements IAuthRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async login(credentials: LoginCredentials): Promise<AuthUser | null> {
    const body = toSigninRequestDto(credentials);
    try {
      const data = await this.httpClient.post<SigninResponseDto>(
        API_ENDPOINTS.AUTH.SIGNIN,
        body
      );
      return toAuthUser(data, {
        email: credentials.email,
        tenantId: credentials.tenantId,
      });
    } catch (err) {
      console.error("[ApiAuthRepository.login]", err);
      return null;
    }
  }

  async register(data: RegisterData): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
  }
}

