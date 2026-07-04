import type {
  DiscountReasonCreateDto,
  DiscountReasonUpdateDto,
} from "@/core/application/dtos/DiscountReasonDto";
import type { DiscountReason } from "@/core/domain/entities/DiscountReason";
import type {
  GetDiscountReasonsParams,
  IDiscountReasonRepository,
} from "@/core/domain/repositories/IDiscountReasonRepository";
import type { IDiscountReasonService } from "@/core/domain/services/IDiscountReasonService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class DiscountReasonService implements IDiscountReasonService {
  constructor(private readonly discountReasonRepository: IDiscountReasonRepository) {}

  getAll(params?: GetDiscountReasonsParams): Promise<PaginatedResult<DiscountReason>> {
    return this.discountReasonRepository.getAll(params);
  }

  getById(id: string): Promise<DiscountReason | null> {
    return this.discountReasonRepository.getById(id);
  }

  create(data: DiscountReasonCreateDto): Promise<DiscountReason> {
    return this.discountReasonRepository.create(data);
  }

  update(id: string, data: DiscountReasonUpdateDto): Promise<DiscountReason> {
    return this.discountReasonRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.discountReasonRepository.delete(id);
  }
}
