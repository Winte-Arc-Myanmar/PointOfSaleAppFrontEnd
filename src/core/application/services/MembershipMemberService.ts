import type { IMembershipMemberService } from "@/core/domain/services/IMembershipMemberService";
import type { IMembershipMemberRepository } from "@/core/domain/repositories/IMembershipMemberRepository";
import type {
  MembershipBindCardRequest,
  MembershipMember,
  MembershipRefundRequest,
  MembershipRegisterRequest,
  MembershipTopupRequest,
} from "@/core/domain/entities/MembershipMember";
import type { GetMembershipMembersParams } from "@/core/domain/repositories/IMembershipMemberRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class MembershipMemberService implements IMembershipMemberService {
  constructor(
    private readonly membershipMemberRepository: IMembershipMemberRepository,
  ) {}

  getAll(params?: GetMembershipMembersParams): Promise<PaginatedResult<MembershipMember>> {
    return this.membershipMemberRepository.getAll(params);
  }

  getById(id: string): Promise<MembershipMember | null> {
    return this.membershipMemberRepository.getById(id);
  }

  register(data: MembershipRegisterRequest): Promise<MembershipMember> {
    return this.membershipMemberRepository.register(data);
  }

  topup(id: string, data: MembershipTopupRequest): Promise<MembershipMember> {
    return this.membershipMemberRepository.topup(id, data);
  }

  refund(id: string, data: MembershipRefundRequest): Promise<MembershipMember> {
    return this.membershipMemberRepository.refund(id, data);
  }

  bindCard(id: string, data: MembershipBindCardRequest): Promise<MembershipMember> {
    return this.membershipMemberRepository.bindCard(id, data);
  }

  unbindCard(id: string): Promise<MembershipMember> {
    return this.membershipMemberRepository.unbindCard(id);
  }

  close(id: string): Promise<MembershipMember> {
    return this.membershipMemberRepository.close(id);
  }
}
