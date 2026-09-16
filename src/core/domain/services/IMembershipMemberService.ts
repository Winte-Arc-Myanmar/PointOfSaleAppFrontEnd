/**
 * Membership member service interface.
 * Domain layer.
 */

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
  unbindCard(id: string, cardId?: string): Promise<MembershipMember>;
  close(id: string, data: MembershipCloseRequest): Promise<MembershipMember>;
  voidWallet(id: string, data: MembershipVoidRequest): Promise<MembershipMember>;
  getSettlementQuote(id: string): Promise<MembershipSettlementQuote | null>;
  beginSettlement(id: string): Promise<MembershipMember>;
  cancelSettlement(id: string): Promise<MembershipMember>;
  getCards(id: string): Promise<MembershipGuestCard[]>;
  getAllGuestCards(
    params?: GetMembershipMembersParams,
  ): Promise<PaginatedResult<MembershipGuestCard>>;
  getGuestCardById(id: string): Promise<MembershipGuestCard | null>;
  lookupCard(cardUid: string): Promise<MembershipGuestCard | null>;
  getLedger(
    id: string,
    params?: GetMembershipMembersParams,
  ): Promise<PaginatedResult<MembershipLedgerEntry>>;
  getAudit(id: string): Promise<MembershipWalletAudit | null>;
  reportLostCard(walletId: string, cardId: string): Promise<MembershipMember>;
  replaceCard(
    walletId: string,
    cardId: string,
    data: MembershipReplaceCardRequest,
  ): Promise<MembershipMember>;
}
