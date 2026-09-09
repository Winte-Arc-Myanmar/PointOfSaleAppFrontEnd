/**
 * Membership member service interface.
 * Domain layer.
 */

import type {
  MembershipBindCardRequest,
  MembershipMember,
  MembershipRefundRequest,
  MembershipRegisterRequest,
  MembershipTopupRequest,
} from "../entities/MembershipMember";
import type { GetMembershipMembersParams } from "../repositories/IMembershipMemberRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IMembershipMemberService {
  getAll(params?: GetMembershipMembersParams): Promise<PaginatedResult<MembershipMember>>;
  getById(id: string): Promise<MembershipMember | null>;
  register(data: MembershipRegisterRequest): Promise<MembershipMember>;
  topup(id: string, data: MembershipTopupRequest): Promise<MembershipMember>;
  refund(id: string, data: MembershipRefundRequest): Promise<MembershipMember>;
  bindCard(id: string, data: MembershipBindCardRequest): Promise<MembershipMember>;
  unbindCard(id: string): Promise<MembershipMember>;
  close(id: string): Promise<MembershipMember>;
}
