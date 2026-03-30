/**
 * UOM repository 
 * Infrastructure layer.
 */

import type {
  IUomRepository,
  GetUomsParams,
} from "@/core/domain/repositories/IUomRepository";
import type { Uom } from "@/core/domain/entities/Uom";
import type { UomDto } from "@/core/application/dtos/UomDto";
import { toUom } from "@/core/application/mappers/UomMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

function toApiDecimalString(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return "0";
    const n = Number(t);
    return Number.isFinite(n) ? String(n) : "0";
  }
  return "0";
}

/** API expects conversionRateToBase as a decimal string, not JSON number. */
function normalizeUomWritePayload(data: Omit<UomDto, "id">): Record<string, unknown> {
  const { conversionRateToBase, ...rest } = data;
  return {
    ...rest,
    conversionRateToBase: toApiDecimalString(conversionRateToBase),
  };
}

export class ApiUomRepository implements IUomRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetUomsParams): Promise<Uom[]> {
    const query: Record<string, number | string | undefined> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };
    if (params?.classId) query.classId = params.classId;
    const res = await this.httpClient.get<UomDto[] | { data?: UomDto[] }>(
      API_ENDPOINTS.UOMS.LIST,
      { params: query }
    );
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((dto): dto is UomDto & { id: string } => !!dto?.id)
      .map((d) => toUom(d as Parameters<typeof toUom>[0]));
  }

  async getById(id: string): Promise<Uom | null> {
    try {
      const dto = await this.httpClient.get<UomDto>(
        API_ENDPOINTS.UOMS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toUom(dto as UomDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: Omit<UomDto, "id">): Promise<Uom> {
    const dto = await this.httpClient.post<UomDto>(
      API_ENDPOINTS.UOMS.CREATE,
      normalizeUomWritePayload(data)
    );
    if (!dto?.id) throw new Error("Create UOM response missing id");
    return toUom(dto as UomDto & { id: string });
  }

  async update(id: string, data: Omit<UomDto, "id">): Promise<Uom> {
    const dto = await this.httpClient.patch<UomDto>(
      API_ENDPOINTS.UOMS.UPDATE(id),
      normalizeUomWritePayload(data)
    );
    return toUom({
      ...dto,
      id: dto?.id ?? id,
    } as UomDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.UOMS.DELETE(id));
  }
}
