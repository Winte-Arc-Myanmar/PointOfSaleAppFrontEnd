/**
 * Location repository — HTTP adapter.
 */

import type {
  ILocationRepository,
  GetLocationsParams,
} from "@/core/domain/repositories/ILocationRepository";
import type { Location, LocationTreeNode } from "@/core/domain/entities/Location";
import type { LocationDto } from "@/core/application/dtos/LocationDto";
import { toLocation, toLocationTreeNode } from "@/core/application/mappers/LocationMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

function normalizeLocationWrite(
  data: Omit<LocationDto, "id" | "subLocations">
): Record<string, unknown> {
  const { parentLocationId, ...rest } = data;
  const out: Record<string, unknown> = { ...rest };
  if (parentLocationId === null) {
    out.parentLocationId = null;
  } else {
    const p =
      parentLocationId != null ? String(parentLocationId).trim() : "";
    if (p) out.parentLocationId = p;
  }
  return out;
}

function parseTreeRoots(body: unknown): LocationTreeNode[] {
  if (body == null) return [];
  if (Array.isArray(body)) {
    return body
      .filter((x): x is LocationDto & { id: string } =>
        !!x && typeof x === "object" && "id" in x && !!(x as LocationDto).id
      )
      .map(toLocationTreeNode);
  }
  if (typeof body === "object" && body !== null && "id" in body) {
    const dto = body as LocationDto;
    if (dto.id) return [toLocationTreeNode(dto as LocationDto & { id: string })];
  }
  return [];
}

export class ApiLocationRepository implements ILocationRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetLocationsParams): Promise<Location[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };
    const res = await this.httpClient.get<
      LocationDto[] | { data?: LocationDto[] }
    >(API_ENDPOINTS.LOCATIONS.LIST, { params: query });
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((dto): dto is LocationDto & { id: string } => !!dto?.id)
      .map((d) => toLocation(d));
  }

  async getTree(): Promise<LocationTreeNode[]> {
    const res = await this.httpClient.get<unknown>(
      API_ENDPOINTS.LOCATIONS.TREE
    );
    return parseTreeRoots(res);
  }

  async getById(id: string): Promise<Location | null> {
    try {
      const dto = await this.httpClient.get<LocationDto>(
        API_ENDPOINTS.LOCATIONS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toLocation(dto as LocationDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(
    data: Omit<LocationDto, "id" | "subLocations">
  ): Promise<Location> {
    const dto = await this.httpClient.post<LocationDto>(
      API_ENDPOINTS.LOCATIONS.CREATE,
      normalizeLocationWrite(data)
    );
    if (!dto?.id) throw new Error("Create location response missing id");
    return toLocation(dto as LocationDto & { id: string });
  }

  async update(
    id: string,
    data: Omit<LocationDto, "id" | "subLocations">
  ): Promise<Location> {
    const dto = await this.httpClient.patch<LocationDto>(
      API_ENDPOINTS.LOCATIONS.UPDATE(id),
      normalizeLocationWrite(data)
    );
    return toLocation({
      ...dto,
      id: dto?.id ?? id,
    } as LocationDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.LOCATIONS.DELETE(id));
  }
}


