/**
 * Branch repository
 * Infrastructure layer.
 */

import type {
  IBranchRepository,
  GetBranchesParams,
} from "@/core/domain/repositories/IBranchRepository";
import type { Branch } from "@/core/domain/entities/Branch";
import type { BranchDto } from "@/core/application/dtos/BranchDto";
import { toBranch } from "@/core/application/mappers/BranchMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

/** API expects latitude/longitude as decimal strings; omit when not both set. */
function normalizeBranchWritePayload(
  data: Omit<BranchDto, "id">
): Record<string, unknown> {
  const { latitude, longitude, ...rest } = data;
  const out: Record<string, unknown> = { ...rest };

  const toNum = (v: unknown): number => {
    if (v == null || v === "") return Number.NaN;
    if (typeof v === "number") return Number.isFinite(v) ? v : Number.NaN;
    if (typeof v === "string") {
      const t = v.trim();
      if (!t) return Number.NaN;
      const n = Number(t);
      return Number.isFinite(n) ? n : Number.NaN;
    }
    return Number.NaN;
  };

  const lat = toNum(latitude);
  const lng = toNum(longitude);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    out.latitude = String(lat);
    out.longitude = String(lng);
  }

  return out;
}

export class ApiBranchRepository implements IBranchRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetBranchesParams): Promise<Branch[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };
    const res = await this.httpClient.get<BranchDto[] | { data?: BranchDto[] }>(
      API_ENDPOINTS.BRANCHES.LIST,
      { params: query }
    );
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((dto): dto is BranchDto & { id: string } => !!dto?.id)
      .map(toBranch);
  }

  async getById(id: string): Promise<Branch | null> {
    try {
      const dto = await this.httpClient.get<BranchDto>(
        API_ENDPOINTS.BRANCHES.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toBranch(dto as BranchDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: Omit<BranchDto, "id">): Promise<Branch> {
    const dto = await this.httpClient.post<BranchDto>(
      API_ENDPOINTS.BRANCHES.CREATE,
      normalizeBranchWritePayload(data)
    );
    if (!dto?.id) throw new Error("Create branch response missing id");
    return toBranch(dto as BranchDto & { id: string });
  }

  async update(id: string, data: Omit<BranchDto, "id">): Promise<Branch> {
    const dto = await this.httpClient.patch<BranchDto>(
      API_ENDPOINTS.BRANCHES.UPDATE(id),
      normalizeBranchWritePayload(data)
    );
    return toBranch({ ...dto, id: dto?.id ?? id } as BranchDto & {
      id: string;
    });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.BRANCHES.DELETE(id));
  }
}
