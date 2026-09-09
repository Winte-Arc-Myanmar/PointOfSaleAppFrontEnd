import type {
  GetMembershipMembersParams,
  IMembershipMemberRepository,
} from "@/core/domain/repositories/IMembershipMemberRepository";
import type {
  MembershipBindCardRequest,
  MembershipMember,
  MembershipRefundRequest,
  MembershipRegisterRequest,
  MembershipTopupRequest,
} from "@/core/domain/entities/MembershipMember";
import type { MembershipMemberDto } from "@/core/application/dtos/MembershipMemberDto";
import { toMembershipMember } from "@/core/application/mappers/MembershipMemberMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function toApiDecimalStringFixed4(value: unknown): string {
  let n: number;
  if (typeof value === "number" && Number.isFinite(value)) n = value;
  else if (typeof value === "string") n = value.trim() ? Number(value.trim()) : 0;
  else n = NaN;
  if (!Number.isFinite(n)) return "0.0000";
  return n.toFixed(4);
}

export class ApiMembershipMemberRepository implements IMembershipMemberRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    params?: GetMembershipMembersParams,
  ): Promise<PaginatedResult<MembershipMember>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.MEMBERSHIPS.LIST,
      {
        params: {
          page,
          limit,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
        },
      },
    );
    const parsed = parsePaginatedResponse<MembershipMemberDto>(
      { data, meta },
      { page, limit },
    );
    return mapPaginatedResult(
      parsed,
      (dto) => toMembershipMember(dto as MembershipMemberDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<MembershipMember | null> {
    try {
      const dto = await this.httpClient.get<MembershipMemberDto>(
        API_ENDPOINTS.MEMBERSHIPS.BY_ID(id),
      );
      if (!dto?.id) return null;
      return toMembershipMember(dto as MembershipMemberDto & { id: string });
    } catch {
      return null;
    }
  }

  async register(data: MembershipRegisterRequest): Promise<MembershipMember> {
    const dto = await this.httpClient.post<MembershipMemberDto>(
      API_ENDPOINTS.MEMBERSHIPS.REGISTER,
      {
        ...data,
        ...(data.initialTopup != null
          ? { initialTopup: toApiDecimalStringFixed4(data.initialTopup) }
          : {}),
      },
    );
    if (!dto?.id) throw new Error("Register membership response missing id");
    return toMembershipMember(dto as MembershipMemberDto & { id: string });
  }

  async topup(id: string, data: MembershipTopupRequest): Promise<MembershipMember> {
    const dto = await this.httpClient.post<MembershipMemberDto>(
      API_ENDPOINTS.MEMBERSHIPS.TOPUP(id),
      {
        amount: toApiDecimalStringFixed4(data.amount),
        ...(data.note ? { note: data.note } : {}),
      },
    );
    return toMembershipMember({
      ...dto,
      id: dto?.id ?? id,
    } as MembershipMemberDto & { id: string });
  }

  async refund(id: string, data: MembershipRefundRequest): Promise<MembershipMember> {
    const dto = await this.httpClient.post<MembershipMemberDto>(
      API_ENDPOINTS.MEMBERSHIPS.REFUND(id),
      {
        amount: toApiDecimalStringFixed4(data.amount),
        ...(data.reason ? { reason: data.reason } : {}),
      },
    );
    return toMembershipMember({
      ...dto,
      id: dto?.id ?? id,
    } as MembershipMemberDto & { id: string });
  }

  async bindCard(
    id: string,
    data: MembershipBindCardRequest,
  ): Promise<MembershipMember> {
    const dto = await this.httpClient.post<MembershipMemberDto>(
      API_ENDPOINTS.MEMBERSHIPS.BIND_CARD(id),
      data,
    );
    return toMembershipMember({
      ...dto,
      id: dto?.id ?? id,
    } as MembershipMemberDto & { id: string });
  }

  async unbindCard(id: string): Promise<MembershipMember> {
    const dto = await this.httpClient.post<MembershipMemberDto>(
      API_ENDPOINTS.MEMBERSHIPS.UNBIND_CARD(id),
    );
    return toMembershipMember({
      ...dto,
      id: dto?.id ?? id,
    } as MembershipMemberDto & { id: string });
  }

  async close(id: string): Promise<MembershipMember> {
    const dto = await this.httpClient.post<MembershipMemberDto>(
      API_ENDPOINTS.MEMBERSHIPS.CLOSE(id),
    );
    return toMembershipMember({
      ...dto,
      id: dto?.id ?? id,
    } as MembershipMemberDto & { id: string });
  }
}
