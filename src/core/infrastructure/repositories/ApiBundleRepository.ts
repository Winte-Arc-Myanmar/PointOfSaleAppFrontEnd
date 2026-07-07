import type {
  BundleCreateDto,
  BundleDto,
  BundleUpdateDto,
} from "@/core/application/dtos/BundleDto";
import { toBundle } from "@/core/application/mappers/BundleMapper";
import type { Bundle } from "@/core/domain/entities/Bundle";
import type {
  GetBundlesParams,
  IBundleRepository,
} from "@/core/domain/repositories/IBundleRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "@/core/infrastructure/api/parsePaginatedResponse";

function normalizeComponents(
  components: BundleCreateDto["components"] | BundleUpdateDto["components"],
) {
  if (!components) return undefined;
  return components.map((item) => ({
    ...item,
    quantity: Number(item.quantity),
    swapGroupId: item.swapGroupId?.trim() || undefined,
  }));
}

export class ApiBundleRepository implements IBundleRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetBundlesParams): Promise<PaginatedResult<Bundle>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.BUNDLES.LIST,
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
    const parsed = parsePaginatedResponse<BundleDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toBundle(dto as BundleDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<Bundle | null> {
    try {
      const dto = await this.httpClient.get<BundleDto>(API_ENDPOINTS.BUNDLES.BY_ID(id));
      if (!dto?.id) return null;
      return toBundle(dto as BundleDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: BundleCreateDto): Promise<Bundle> {
    const dto = await this.httpClient.post<BundleDto>(API_ENDPOINTS.BUNDLES.CREATE, {
      ...data,
      components: normalizeComponents(data.components),
    });
    if (!dto?.id) throw new Error("Create bundle response missing id");
    return toBundle(dto as BundleDto & { id: string });
  }

  async update(id: string, data: BundleUpdateDto): Promise<Bundle> {
    const payload: BundleUpdateDto = {
      ...data,
      ...(data.components ? { components: normalizeComponents(data.components) } : {}),
    };
    const dto = await this.httpClient.patch<BundleDto>(
      API_ENDPOINTS.BUNDLES.UPDATE(id),
      payload,
    );
    return toBundle({ ...dto, id: dto?.id ?? id } as BundleDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.BUNDLES.DELETE(id));
  }
}
