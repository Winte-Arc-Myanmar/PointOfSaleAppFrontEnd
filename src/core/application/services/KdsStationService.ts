import type {
  KdsStationCreateDto,
  KdsStationUpdateDto,
} from "@/core/application/dtos/KdsStationDto";
import type { KdsStation } from "@/core/domain/entities/KdsStation";
import type {
  GetKdsStationsParams,
  IKdsStationRepository,
} from "@/core/domain/repositories/IKdsStationRepository";
import type { IKdsStationService } from "@/core/domain/services/IKdsStationService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class KdsStationService implements IKdsStationService {
  constructor(private readonly kdsStationRepository: IKdsStationRepository) {}

  getAll(params?: GetKdsStationsParams): Promise<PaginatedResult<KdsStation>> {
    return this.kdsStationRepository.getAll(params);
  }

  getById(id: string): Promise<KdsStation | null> {
    return this.kdsStationRepository.getById(id);
  }

  create(data: KdsStationCreateDto): Promise<KdsStation> {
    return this.kdsStationRepository.create(data);
  }

  update(id: string, data: KdsStationUpdateDto): Promise<KdsStation> {
    return this.kdsStationRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.kdsStationRepository.delete(id);
  }
}
