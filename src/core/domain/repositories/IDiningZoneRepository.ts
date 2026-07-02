import type { DiningZone } from "../entities/DiningZone";
import type {
  DiningZoneCreateDto,
  DiningZoneUpdateDto,
} from "@/core/application/dtos/DiningZoneDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetDiningZonesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface IDiningZoneRepository {
  getAll(params?: GetDiningZonesParams): Promise<PaginatedResult<DiningZone>>;
  getById(id: string): Promise<DiningZone | null>;
  create(data: DiningZoneCreateDto): Promise<DiningZone>;
  update(id: string, data: DiningZoneUpdateDto): Promise<DiningZone>;
  delete(id: string): Promise<void>;
}
