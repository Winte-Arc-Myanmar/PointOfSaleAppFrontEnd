import type {
  KdsStationCreateDto,
  KdsStationUpdateDto,
} from "@/core/application/dtos/KdsStationDto";
import type { KdsStation } from "../entities/KdsStation";
import type { PaginatedResult } from "../types/pagination";

export interface GetKdsStationsParams {
  page?: number;
  limit?: number;
  search?: string;
  locationId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface IKdsStationRepository {
  getAll(params?: GetKdsStationsParams): Promise<PaginatedResult<KdsStation>>;
  getById(id: string): Promise<KdsStation | null>;
  create(data: KdsStationCreateDto): Promise<KdsStation>;
  update(id: string, data: KdsStationUpdateDto): Promise<KdsStation>;
  delete(id: string): Promise<void>;
}
