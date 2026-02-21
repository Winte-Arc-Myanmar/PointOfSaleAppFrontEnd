/**
 * Auth service interface.
 * Domain layer - contract for auth operations.
 * Implementations call external backend; swap when API is ready.
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id?: string;
  email: string;
  name?: string | null;
  image?: string | null;
  accessToken?: string;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthUser | null>;
  register(data: RegisterData): Promise<void>;
}
