import type {
  GetKitchenPrintersParams,
  IKitchenPrinterRepository,
} from "@/core/domain/repositories/IKitchenPrinterRepository";
import type { KitchenPrinter } from "@/core/domain/entities/KitchenPrinter";
import type {
  KitchenPrinterCreateDto,
  KitchenPrinterDto,
  KitchenPrinterUpdateDto,
} from "@/core/application/dtos/KitchenPrinterDto";
import { toKitchenPrinter } from "@/core/application/mappers/KitchenPrinterMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import { mapPaginatedResult, parsePaginatedResponse } from "../api/parsePaginatedResponse";

export class ApiKitchenPrinterRepository implements IKitchenPrinterRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetKitchenPrintersParams): Promise<PaginatedResult<KitchenPrinter>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.KITCHEN_PRINTERS.LIST,
      {
        params: {
          page,
          limit,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
        },
      }
    );
    const parsed = parsePaginatedResponse<KitchenPrinterDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toKitchenPrinter(dto as KitchenPrinterDto & { id: string }),
      (dto) => !!dto?.id
    );
  }

  async getById(id: string): Promise<KitchenPrinter | null> {
    try {
      const dto = await this.httpClient.get<KitchenPrinterDto>(
        API_ENDPOINTS.KITCHEN_PRINTERS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toKitchenPrinter(dto as KitchenPrinterDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: KitchenPrinterCreateDto): Promise<KitchenPrinter> {
    const dto = await this.httpClient.post<KitchenPrinterDto>(
      API_ENDPOINTS.KITCHEN_PRINTERS.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create kitchen printer response missing id");
    return toKitchenPrinter(dto as KitchenPrinterDto & { id: string });
  }

  async update(id: string, data: KitchenPrinterUpdateDto): Promise<KitchenPrinter> {
    const dto = await this.httpClient.patch<KitchenPrinterDto>(
      API_ENDPOINTS.KITCHEN_PRINTERS.UPDATE(id),
      data
    );
    return toKitchenPrinter({ ...dto, id: dto?.id ?? id } as KitchenPrinterDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.KITCHEN_PRINTERS.DELETE(id));
  }

  async attachCategory(printerId: string, categoryId: string): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.KITCHEN_PRINTERS.CATEGORIES.ATTACH(printerId), {
      categoryId,
    });
  }

  async detachCategory(printerId: string, categoryId: string): Promise<void> {
    await this.httpClient.delete(
      API_ENDPOINTS.KITCHEN_PRINTERS.CATEGORIES.DETACH(printerId, categoryId)
    );
  }
}
