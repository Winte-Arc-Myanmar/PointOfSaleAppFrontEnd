import type { IMembershipMemberService } from "@/core/domain/services/IMembershipMemberService";
import type { IMembershipMemberRepository } from "@/core/domain/repositories/IMembershipMemberRepository";
import type {
  MembershipBindCardRequest,
  MembershipCloseRequest,
  MembershipGuestCard,
  MembershipLedgerEntry,
  MembershipMember,
  MembershipReplaceCardRequest,
  MembershipRefundRequest,
  MembershipRegisterRequest,
  MembershipSettlementQuote,
  MembershipTopupRequest,
  MembershipVoidRequest,
  MembershipWalletAudit,
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

  unbindCard(id: string, cardId?: string): Promise<MembershipMember> {
    return this.membershipMemberRepository.unbindCard(id, cardId);
  }

  close(id: string, data: MembershipCloseRequest): Promise<MembershipMember> {
    return this.membershipMemberRepository.close(id, data);
  }

  voidWallet(id: string, data: MembershipVoidRequest): Promise<MembershipMember> {
    return this.membershipMemberRepository.voidWallet(id, data);
  }

  getSettlementQuote(id: string): Promise<MembershipSettlementQuote | null> {
    return this.membershipMemberRepository.getSettlementQuote(id);
  }

  beginSettlement(id: string): Promise<MembershipMember> {
    return this.membershipMemberRepository.beginSettlement(id);
  }

  cancelSettlement(id: string): Promise<MembershipMember> {
    return this.membershipMemberRepository.cancelSettlement(id);
  }

  getCards(id: string): Promise<MembershipGuestCard[]> {
    return this.membershipMemberRepository.getCards(id);
  }

  getAllGuestCards(
    params?: GetMembershipMembersParams,
  ): Promise<PaginatedResult<MembershipGuestCard>> {
    return this.membershipMemberRepository.getAllGuestCards(params);
  }

  getGuestCardById(id: string): Promise<MembershipGuestCard | null> {
    return this.membershipMemberRepository.getGuestCardById(id);
  }

  lookupCard(cardUid: string): Promise<MembershipGuestCard | null> {
    return this.membershipMemberRepository.lookupCard(cardUid);
  }

  getLedger(
    id: string,
    params?: GetMembershipMembersParams,
  ): Promise<PaginatedResult<MembershipLedgerEntry>> {
    return this.membershipMemberRepository.getLedger(id, params);
  }

  getAudit(id: string): Promise<MembershipWalletAudit | null> {
    return this.membershipMemberRepository.getAudit(id);
  }

  reportLostCard(walletId: string, cardId: string): Promise<MembershipMember> {
    return this.membershipMemberRepository.reportLostCard(walletId, cardId);
  }

  replaceCard(
    walletId: string,
    cardId: string,
    data: MembershipReplaceCardRequest,
  ): Promise<MembershipMember> {
    return this.membershipMemberRepository.replaceCard(walletId, cardId, data);
  }
}
