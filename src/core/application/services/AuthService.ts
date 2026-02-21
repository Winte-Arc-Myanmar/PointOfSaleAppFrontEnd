/**
 * Auth service implementation.
 * Application layer - delegates to IAuthRepository 
 */

import type { IAuthService } from "@/core/domain/services/IAuthService";
import type { IAuthRepository } from "@/core/domain/repositories/IAuthRepository";
import type {
  LoginCredentials,
  RegisterData,
} from "@/core/domain/services/IAuthService";

export class AuthService implements IAuthService {
  constructor(private readonly authRepository: IAuthRepository) {}

  async login(credentials: LoginCredentials) {
    return this.authRepository.login(credentials);
  }

  async register(data: RegisterData): Promise<void> {
    return this.authRepository.register(data);
  }
}
