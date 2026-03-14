/**
 * DTOs for auth API request/response.
 * Application layer - matches backend contract (snake_case, fullName, etc.).
 */

/** Request body for POST /auth/signin. */
export interface SigninRequestDto {
  email: string;
  password: string;
  type: "user" | "system_admin";
  tenantId?: string;
  branchId?: string;
}

/** User object in signin response. */
export interface SigninUserDto {
  id?: string;
  email?: string;
  fullName?: string | null;
  name?: string | null;
  image?: string | null;
  type?: string;
  tenantId?: string;
  branchId?: string | null;
}

/** Response from POST /auth/signin. */
export interface SigninResponseDto {
  access_token?: string;
  token?: string;
  accessToken?: string;
  user?: SigninUserDto;
}