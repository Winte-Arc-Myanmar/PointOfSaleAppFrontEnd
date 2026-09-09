/**
 * Membership member repository interface.
 * Domain layer.
 */

import type {
  MembershipBindCardRequest,
  MembershipMember,
  MembershipRefundRequest,
  MembershipRegisterRequest,
  MembershipTopupRequest,
} from "../entities/MembershipMember";
import type { PaginatedResult } from "../types/pagination";

export interface GetMembershipMembersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IMembershipMemberRepository {
  getAll(params?: GetMembershipMembersParams): Promise<PaginatedResult<MembershipMember>>;
  getById(id: string): Promise<MembershipMember | null>;
  register(data: MembershipRegisterRequest): Promise<MembershipMember>;
  topup(id: string, data: MembershipTopupRequest): Promise<MembershipMember>;
  refund(id: string, data: MembershipRefundRequest): Promise<MembershipMember>;
  bindCard(id: string, data: MembershipBindCardRequest): Promise<MembershipMember>;
  unbindCard(id: string): Promise<MembershipMember>;
  close(id: string): Promise<MembershipMember>;
}
