/**
 * DTOs for auth API request/response.
 * Application layer - matches backend contract.
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
}

/** Per-branch access entry in signin response. */
export interface BranchAccessDto {
  branchId: string;
  roles: string[];
  permissions: string[];
}

/** Response from POST /auth/signin (after HttpClient unwraps `data`). */
export interface SigninResponseDto {
  access_token?: string;
  token?: string;
  accessToken?: string;
  user?: SigninUserDto;
  activeBranch?: string;
  access?: BranchAccessDto[];
}
