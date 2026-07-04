import type {
  VoidReasonCreateDto,
  VoidReasonUpdateDto,
} from "@/core/application/dtos/VoidReasonDto";
import type { VoidReason } from "@/core/domain/entities/VoidReason";
import type {
  GetVoidReasonsParams,
  IVoidReasonRepository,
} from "@/core/domain/repositories/IVoidReasonRepository";
import type { IVoidReasonService } from "@/core/domain/services/IVoidReasonService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class VoidReasonService implements IVoidReasonService {
  constructor(private readonly voidReasonRepository: IVoidReasonRepository) {}

  getAll(params?: GetVoidReasonsParams): Promise<PaginatedResult<VoidReason>> {
    return this.voidReasonRepository.getAll(params);
  }

  getById(id: string): Promise<VoidReason | null> {
    return this.voidReasonRepository.getById(id);
  }

  create(data: VoidReasonCreateDto): Promise<VoidReason> {
    return this.voidReasonRepository.create(data);
  }

  update(id: string, data: VoidReasonUpdateDto): Promise<VoidReason> {
    return this.voidReasonRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.voidReasonRepository.delete(id);
  }
}
