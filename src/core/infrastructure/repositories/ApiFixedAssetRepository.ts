import type {
  IFixedAssetRepository,
  GetFixedAssetsParams,
  FixedAssetWriteDto,
} from "@/core/domain/repositories/IFixedAssetRepository";
import type { FixedAsset } from "@/core/domain/entities/FixedAsset";
import type { FixedAssetDto } from "@/core/application/dtos/FixedAssetDto";
import { toFixedAsset } from "@/core/application/mappers/FixedAssetMapper";
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

function normalizeWritePayload(data: FixedAssetWriteDto): Record<string, unknown> {
  return {
    tenantId: data.tenantId,
    assetName: data.assetName,
    serialNumber: data.serialNumber,
    assetAccountId: data.assetAccountId,
    depreciationExpenseAccountId: data.depreciationExpenseAccountId,
    accumulatedDepreciationAccountId: data.accumulatedDepreciationAccountId,
    purchaseDate: data.purchaseDate,
    purchaseCost: toApiDecimalStringFixed4(data.purchaseCost),
    salvageValue: toApiDecimalStringFixed4(data.salvageValue),
    usefulLifeMonths: data.usefulLifeMonths,
    depreciationMethod: data.depreciationMethod,
    status: data.status,
  };
}

export class ApiFixedAssetRepository implements IFixedAssetRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetFixedAssetsParams): Promise<PaginatedResult<FixedAsset>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.FIXED_ASSETS.LIST,
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
    const parsed = parsePaginatedResponse<FixedAssetDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toFixedAsset(dto as FixedAssetDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<FixedAsset | null> {
    try {
      const dto = await this.httpClient.get<FixedAssetDto>(
        API_ENDPOINTS.FIXED_ASSETS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toFixedAsset(dto as FixedAssetDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: FixedAssetWriteDto): Promise<FixedAsset> {
    const dto = await this.httpClient.post<FixedAssetDto>(
      API_ENDPOINTS.FIXED_ASSETS.CREATE,
      normalizeWritePayload(data)
    );
    if (!dto?.id) throw new Error("Create fixed asset response missing id");
    return toFixedAsset(dto as FixedAssetDto & { id: string });
  }

  async update(id: string, data: FixedAssetWriteDto): Promise<FixedAsset> {
    const dto = await this.httpClient.patch<FixedAssetDto>(
      API_ENDPOINTS.FIXED_ASSETS.UPDATE(id),
      normalizeWritePayload(data)
    );
    return toFixedAsset({ ...dto, id: dto?.id ?? id } as FixedAssetDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.FIXED_ASSETS.DELETE(id));
  }
}
