import type { IDiningZoneService } from "@/core/domain/services/IDiningZoneService";
import type { IDiningZoneRepository } from "@/core/domain/repositories/IDiningZoneRepository";
import type { DiningZone } from "@/core/domain/entities/DiningZone";
import type { GetDiningZonesParams } from "@/core/domain/repositories/IDiningZoneRepository";
import type {
  DiningZoneCreateDto,
  DiningZoneUpdateDto,
} from "../dtos/DiningZoneDto";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class DiningZoneService implements IDiningZoneService {
  constructor(private readonly diningZoneRepository: IDiningZoneRepository) {}

  getAll(params?: GetDiningZonesParams): Promise<PaginatedResult<DiningZone>> {
    return this.diningZoneRepository.getAll(params);
  }

  getById(id: string): Promise<DiningZone | null> {
    return this.diningZoneRepository.getById(id);
  }

  create(data: DiningZoneCreateDto): Promise<DiningZone> {
    return this.diningZoneRepository.create(data);
  }

  update(id: string, data: DiningZoneUpdateDto): Promise<DiningZone> {
    return this.diningZoneRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.diningZoneRepository.delete(id);
  }
}
