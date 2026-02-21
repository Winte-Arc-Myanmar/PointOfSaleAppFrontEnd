/**
 * Auth repository interface.
 * Domain layer - contract for auth data access (login/register via external API).
 */

import type { LoginCredentials, RegisterData, AuthUser } from "../services/IAuthService";

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthUser | null>;
  register(data: RegisterData): Promise<void>;
}
