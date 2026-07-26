import type { IGrnLineService } from "@/core/domain/services/IGrnLineService";
import type { IGrnLineRepository } from "@/core/domain/repositories/IGrnLineRepository";
import type { GrnLine } from "@/core/domain/entities/GrnLine";
import type {
  GetGrnLinesParams,
  GrnLineWriteDto,
} from "@/core/domain/repositories/IGrnLineRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class GrnLineService implements IGrnLineService {
  constructor(private readonly grnLineRepository: IGrnLineRepository) {}

  getAll(
    grnId: string,
    params?: GetGrnLinesParams,
  ): Promise<PaginatedResult<GrnLine>> {
    return this.grnLineRepository.getAll(grnId, params);
  }

  getById(grnId: string, id: string): Promise<GrnLine | null> {
    return this.grnLineRepository.getById(grnId, id);
  }

  create(grnId: string, data: GrnLineWriteDto): Promise<GrnLine> {
    return this.grnLineRepository.create(grnId, data);
  }

  update(
    grnId: string,
    id: string,
    data: GrnLineWriteDto,
  ): Promise<GrnLine> {
    return this.grnLineRepository.update(grnId, id, data);
  }

  delete(grnId: string, id: string): Promise<void> {
    return this.grnLineRepository.delete(grnId, id);
  }
}
