import type {
  KdsStationCreateDto,
  KdsStationUpdateDto,
} from "@/core/application/dtos/KdsStationDto";
import type { KdsStation } from "../entities/KdsStation";
import type { GetKdsStationsParams } from "../repositories/IKdsStationRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IKdsStationService {
  getAll(params?: GetKdsStationsParams): Promise<PaginatedResult<KdsStation>>;
  getById(id: string): Promise<KdsStation | null>;
  create(data: KdsStationCreateDto): Promise<KdsStation>;
  update(id: string, data: KdsStationUpdateDto): Promise<KdsStation>;
  delete(id: string): Promise<void>;
}
