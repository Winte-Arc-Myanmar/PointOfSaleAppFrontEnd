import type {
  IPosSessionRepository,
  GetPosSessionsParams,
} from "@/core/domain/repositories/IPosSessionRepository";
import type { PosSession } from "@/core/domain/entities/PosSession";
import type {
  PosSessionDto,
  ClosePosSessionRequestDto,
  PosSessionSummaryDto,
} from "@/core/application/dtos/PosSessionDto";
import { toPosSession, toPosSessionSummary } from "@/core/application/mappers/PosSessionMapper";
import type { PosSessionSummary } from "@/core/domain/entities/PosSessionSummary";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

function toApiDecimalStringFixed4(value: unknown): string {
  let n: number;
  if (typeof value === "number" && Number.isFinite(value)) n = value;
  else if (typeof value === "string") n = value.trim() ? Number(value.trim()) : 0;
  else n = NaN;
  if (!Number.isFinite(n)) return "0.0000";
  return n.toFixed(4);
}

function normalizeWritePayload(
  data: Omit<PosSessionDto, "id" | "openedAt" | "updatedAt">
): Record<string, unknown> {
  return {
    ...data,
    openingCashFloat: toApiDecimalStringFixed4((data as any).openingCashFloat),
    expectedClosingCash: toApiDecimalStringFixed4((data as any).expectedClosingCash),
    actualClosingCash:
      (data as any).actualClosingCash == null
        ? null
        : toApiDecimalStringFixed4((data as any).actualClosingCash),
    cashVariance:
      (data as any).cashVariance == null
        ? null
        : toApiDecimalStringFixed4((data as any).cashVariance),
  };
}

export class ApiPosSessionRepository implements IPosSessionRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetPosSessionsParams): Promise<PosSession[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
      ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
    };
    const res = await this.httpClient.get<
      PosSessionDto[] | { data?: PosSessionDto[] }
    >(API_ENDPOINTS.POS_SESSIONS.LIST, { params: query });
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((d): d is PosSessionDto & { id: string } => !!d?.id)
      .map((d) => toPosSession(d as any));
  }

  async getById(id: string): Promise<PosSession | null> {
    try {
      const dto = await this.httpClient.get<PosSessionDto>(
        API_ENDPOINTS.POS_SESSIONS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toPosSession(dto as any);
    } catch {
      return null;
    }
  }

  async create(
    data: Omit<PosSessionDto, "id" | "openedAt" | "updatedAt">
  ): Promise<PosSession> {
    const dto = await this.httpClient.post<PosSessionDto>(
      API_ENDPOINTS.POS_SESSIONS.CREATE,
      normalizeWritePayload(data)
    );
    if (!dto?.id) throw new Error("Create POS session response missing id");
    return toPosSession(dto as any);
  }

  async update(
    id: string,
    data: Omit<PosSessionDto, "id" | "openedAt" | "updatedAt">
  ): Promise<PosSession> {
    const dto = await this.httpClient.patch<PosSessionDto>(
      API_ENDPOINTS.POS_SESSIONS.UPDATE(id),
      normalizeWritePayload(data)
    );
    return toPosSession({ ...(dto as any), id: (dto as any)?.id ?? id } as any);
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.POS_SESSIONS.DELETE(id));
  }

  async close(id: string, data: ClosePosSessionRequestDto): Promise<PosSessionSummary> {
    const dto = await this.httpClient.post<PosSessionSummaryDto>(
      API_ENDPOINTS.POS_SESSIONS.CLOSE(id),
      { actualClosingCash: toApiDecimalStringFixed4((data as any).actualClosingCash) }
    );
    return toPosSessionSummary(dto as any);
  }

  async getSummary(id: string): Promise<PosSessionSummary> {
    const dto = await this.httpClient.get<PosSessionSummaryDto>(
      API_ENDPOINTS.POS_SESSIONS.SUMMARY(id)
    );
    return toPosSessionSummary(dto as any);
  }
}



