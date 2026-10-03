import type {
  SpaPackage,
  SpaPackageInput,
  SpaRoom,
  SpaRoomInput,
} from "@/core/domain/entities/Spa";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import { mapPaginatedResult, parsePaginatedResponse } from "../api/parsePaginatedResponse";

type PackageDto = Omit<SpaPackage, "price"> & { price: string | number };

const toPackage = (dto: PackageDto): SpaPackage => ({
  id: String(dto.id),
  tenantId: dto.tenantId ?? "",
  name: dto.name ?? "",
  description: dto.description ?? null,
  durationMinutes: Number(dto.durationMinutes) || 0,
  price: Number(dto.price) || 0,
  isActive: dto.isActive !== false,
  items: (dto.items ?? []).map((i) => ({
    variantId: String(i.variantId),
    name: i.name ?? "",
    quantity: Number(i.quantity) || 1,
  })),
});

const toRoom = (dto: SpaRoom): SpaRoom => ({
  id: String(dto.id),
  tenantId: dto.tenantId ?? "",
  locationId: dto.locationId ?? "",
  roomNumber: dto.roomNumber ?? "",
  name: dto.name ?? null,
  capacity: Number(dto.capacity) || 1,
  status: dto.status ?? "AVAILABLE",
});

export interface SpaListParams {
  page?: number;
  limit?: number;
  search?: string;
}

async function list<D, T>(
  httpClient: HttpClient,
  url: string,
  params: SpaListParams | undefined,
  map: (dto: D) => T,
): Promise<PaginatedResult<T>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;
  const { data, meta } = await httpClient.getPaginated<unknown>(url, {
    params: { page, limit, ...(params?.search ? { search: params.search } : {}) },
  });
  const parsed = parsePaginatedResponse<D>({ data, meta }, { page, limit });
  return mapPaginatedResult(parsed, map, (dto) => !!(dto as { id?: string })?.id);
}

export class ApiSpaRepository {
  constructor(private readonly httpClient: HttpClient) {}

  listPackages(params?: SpaListParams) {
    return list<PackageDto, SpaPackage>(this.httpClient, API_ENDPOINTS.SPA_PACKAGES.LIST, params, toPackage);
  }
  async getPackage(id: string) {
    return toPackage(await this.httpClient.get<PackageDto>(API_ENDPOINTS.SPA_PACKAGES.BY_ID(id)));
  }
  async createPackage(data: SpaPackageInput) {
    return toPackage(await this.httpClient.post<PackageDto>(API_ENDPOINTS.SPA_PACKAGES.LIST, data));
  }
  async updatePackage(id: string, data: SpaPackageInput) {
    return toPackage(await this.httpClient.patch<PackageDto>(API_ENDPOINTS.SPA_PACKAGES.BY_ID(id), data));
  }
  async removePackage(id: string) {
    await this.httpClient.delete(API_ENDPOINTS.SPA_PACKAGES.BY_ID(id));
  }

  listRooms(params?: SpaListParams) {
    return list<SpaRoom, SpaRoom>(this.httpClient, API_ENDPOINTS.SPA_ROOMS.LIST, params, toRoom);
  }
  async getRoom(id: string) {
    return toRoom(await this.httpClient.get<SpaRoom>(API_ENDPOINTS.SPA_ROOMS.BY_ID(id)));
  }
  async createRoom(data: SpaRoomInput) {
    return toRoom(await this.httpClient.post<SpaRoom>(API_ENDPOINTS.SPA_ROOMS.LIST, data));
  }
  async updateRoom(id: string, data: Partial<SpaRoomInput>) {
    return toRoom(await this.httpClient.patch<SpaRoom>(API_ENDPOINTS.SPA_ROOMS.BY_ID(id), data));
  }
  async markRoomReady(id: string) {
    await this.httpClient.post(API_ENDPOINTS.SPA_ROOMS.READY(id), {});
  }
  async removeRoom(id: string) {
    await this.httpClient.delete(API_ENDPOINTS.SPA_ROOMS.BY_ID(id));
  }
}
